import { inject, injectable } from "tsyringe";
import AppError from "@shared/errors/AppError";
import ICompaniesRepository from "../repositories/ICompaniesRepository";
import IUsersRepository from "@modules/users/repositories/IUsersRepository";
import Company from "../infra/prisma/entities/Company";

interface IRequest {
  userId: string;
  name: string;
  cnpj: string;
  phone: string;
  segment: string;
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
}

@injectable()
export default class CreateCompanyService {
  constructor(
    @inject("CompaniesRepository")
    private companiesRepository: ICompaniesRepository,

    @inject("UsersRepository")
    private usersRepository: IUsersRepository,
  ) {}

  public async execute({
    userId,
    name,
    cnpj,
    phone,
    segment,
    cep,
    street,
    number,
    neighborhood,
    city,
    state,
  }: IRequest): Promise<Company> {
    const cnpjDigits = cnpj.replace(/\D/g, "");
    if (cnpjDigits.length !== 14) {
      throw new AppError("CNPJ deve conter exatamente 14 dígitos.");
    }

    const validSegments = ["restaurant", "e-commerce"];
    if (!validSegments.includes(segment)) {
      throw new AppError(
        "Segmento inválido. Use 'restaurant' ou 'e-commerce'.",
      );
    }

    const cepDigits = cep.replace(/\D/g, "");
    if (cepDigits.length !== 8) {
      throw new AppError("CEP deve conter exatamente 8 dígitos.");
    }

    if (state.length !== 2) {
      throw new AppError("Estado deve ser a sigla UF com 2 caracteres.");
    }

    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      throw new AppError(
        "Telefone inválido. Informe 10 ou 11 dígitos numéricos.",
      );
    }

    const cnpjExists = await this.companiesRepository.findByCnpj(cnpjDigits);

    if (cnpjExists) {
      throw new AppError("Este CNPJ já está cadastrado.");
    }

    const company = await this.companiesRepository.create({
      name,
      cnpj: cnpjDigits,
      phone: phoneDigits,
      segment,
      cep: cepDigits,
      street,
      number,
      neighborhood,
      city,
      state: state.toUpperCase(),
    });

    await this.usersRepository.updateCompanyId(userId, company.id);

    return company;
  }
}
