import Company from "../infra/prisma/entities/Company";
import ICreateCompanyDTO from "../dtos/ICreateCompanyDTO";

export default interface ICompaniesRepository {
  findById(id: string): Promise<Company | undefined>;
  findByCnpj(cnpj: string): Promise<Company | undefined>;
  create(data: ICreateCompanyDTO): Promise<Company>;
  updateLogoUrl(id: string, logoUrl: string): Promise<Company>;
}
