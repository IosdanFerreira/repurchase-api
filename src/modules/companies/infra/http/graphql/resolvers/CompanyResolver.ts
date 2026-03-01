import {
  Resolver,
  Mutation,
  Arg,
  UseMiddleware,
  Ctx,
  FieldResolver,
  Root,
} from "type-graphql";
import { container } from "tsyringe";
import { GraphQLUpload as GraphQLUploadType } from "apollo-server-express";
import Company from "@modules/companies/infra/prisma/entities/Company";
import Address from "@modules/companies/infra/prisma/entities/Address";
import CreateCompanyService from "@modules/companies/services/CreateCompanyService";
import UploadCompanyLogoService from "@modules/companies/services/UploadCompanyLogoService";
import CreateCompanyInput from "../inputs/CreateCompanyInput";
import authMiddleware from "@modules/users/infra/middlewares/authMiddleware";
import rateLimiterMiddleware from "@modules/users/infra/middlewares/rateLimiterMiddleware";
import { IUserContext } from "@modules/users/infra/http/graphql/context/IUserContext";

@Resolver(() => Company)
export default class CompanyResolver {
  @FieldResolver(() => Address)
  address(@Root() company: Company): Address {
    return {
      cep: company.cep,
      street: company.street,
      number: company.number,
      neighborhood: company.neighborhood,
      city: company.city,
      state: company.state,
    };
  }

  @Mutation(() => Company)
  @UseMiddleware(rateLimiterMiddleware, authMiddleware)
  async createCompany(
    @Arg("input") input: CreateCompanyInput,
    @Ctx() ctx: IUserContext,
  ): Promise<Company> {
    const createCompany = container.resolve(CreateCompanyService);
    return createCompany.execute({
      userId: ctx.userId!,
      name: input.name,
      cnpj: input.cnpj,
      phone: input.phone,
      segment: input.segment,
      cep: input.address.cep,
      street: input.address.street,
      number: input.address.number,
      neighborhood: input.address.neighborhood,
      city: input.address.city,
      state: input.address.state,
    });
  }

  @Mutation(() => Company)
  @UseMiddleware(rateLimiterMiddleware, authMiddleware)
  async uploadCompanyLogo(
    @Arg("company_id") company_id: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Arg("file", () => GraphQLUploadType as any) file: any,
    @Ctx() ctx: IUserContext,
  ): Promise<Company> {
    const uploadCompanyLogo = container.resolve(UploadCompanyLogoService);
    return uploadCompanyLogo.execute({
      userId: ctx.userId!,
      companyId: company_id,
      file,
    });
  }
}
