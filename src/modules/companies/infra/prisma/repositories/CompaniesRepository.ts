import Company from "../entities/Company";
import ICompaniesRepository from "@modules/companies/repositories/ICompaniesRepository";
import ICreateCompanyDTO from "@modules/companies/dtos/ICreateCompanyDTO";
import prisma from "@shared/database/prisma";

export default class CompaniesRepository implements ICompaniesRepository {
  public async findById(id: string): Promise<Company | undefined> {
    const company = await prisma.company.findUnique({
      where: { id },
    });

    return (company as Company) ?? undefined;
  }

  public async findByCnpj(cnpj: string): Promise<Company | undefined> {
    const company = await prisma.company.findUnique({
      where: { cnpj },
    });

    return (company as Company) ?? undefined;
  }

  public async create(data: ICreateCompanyDTO): Promise<Company> {
    const company = await prisma.company.create({
      data: {
        name: data.name,
        cnpj: data.cnpj,
        phone: data.phone,
        segment: data.segment,
        cep: data.cep,
        street: data.street,
        number: data.number,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
      },
    });

    return company as Company;
  }

  public async updateLogoUrl(id: string, logoUrl: string): Promise<Company> {
    const company = await prisma.company.update({
      where: { id },
      data: { logoUrl },
    });

    return company as Company;
  }
}
