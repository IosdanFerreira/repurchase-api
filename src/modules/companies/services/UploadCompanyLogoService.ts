import { inject, injectable } from "tsyringe";
import { createWriteStream, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { Readable } from "stream";
import { v4 as uuid } from "uuid";
import AppError from "@shared/errors/AppError";
import ICompaniesRepository from "../repositories/ICompaniesRepository";
import IUsersRepository from "@modules/users/repositories/IUsersRepository";
import Company from "../infra/prisma/entities/Company";

interface IFileUpload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream(): NodeJS.ReadableStream;
}

interface IRequest {
  userId: string;
  companyId: string;
  file: Promise<IFileUpload>;
}

const UPLOAD_DIR = join(process.cwd(), "uploads", "logos");
const ALLOWED_MIMETYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/svg+xml",
];
const MAX_FILE_SIZE = Number(process.env.UPLOAD_MAX_SIZE) || 2097152; // 2MB

@injectable()
export default class UploadCompanyLogoService {
  constructor(
    @inject("CompaniesRepository")
    private companiesRepository: ICompaniesRepository,

    @inject("UsersRepository")
    private usersRepository: IUsersRepository,
  ) {}

  public async execute({
    userId,
    companyId,
    file,
  }: IRequest): Promise<Company> {
    const user = await this.usersRepository.findById(userId);

    if (!user || user.companyId !== companyId) {
      throw new AppError("Não autorizado.");
    }

    const company = await this.companiesRepository.findById(companyId);

    if (!company) {
      throw new AppError("Empresa não encontrada.");
    }

    const { createReadStream, filename, mimetype } = await file;

    if (!ALLOWED_MIMETYPES.includes(mimetype)) {
      throw new AppError("Formato inválido. Use PNG, JPG ou SVG.");
    }

    if (!existsSync(UPLOAD_DIR)) {
      mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const ext = filename.split(".").pop();
    const newFilename = `${uuid()}.${ext}`;
    const filePath = join(UPLOAD_DIR, newFilename);

    await new Promise<void>((resolve, reject) => {
      const stream = createReadStream() as Readable;
      let fileSize = 0;

      stream.on("data", (chunk: Buffer) => {
        fileSize += chunk.length;
        if (fileSize > MAX_FILE_SIZE) {
          stream.destroy();
          reject(new AppError("O arquivo deve ter no máximo 2MB."));
        }
      });

      const writeStream = createWriteStream(filePath);
      stream.pipe(writeStream);
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });

    const logoUrl = `/uploads/logos/${newFilename}`;
    const updatedCompany = await this.companiesRepository.updateLogoUrl(
      companyId,
      logoUrl,
    );

    return updatedCompany;
  }
}
