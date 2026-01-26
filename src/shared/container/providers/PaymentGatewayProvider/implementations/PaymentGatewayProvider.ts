import * as Sentry from "@sentry/node";

import AppError from "@shared/errors/AppError";
import { IAsaasCreditCardResponse } from "../interfaces/IAsaasCreditCardResponse";
import { IAsaasCustomerResponse } from "../interfaces/IAsaasCustomerResponse";
import { IAsaasSubscriptionResponse } from "../interfaces/IAsaasSubscriptionResponse";
import ICreateCardDTO from "../dtos/ICreateCardDTO";
import ICreateCustomerDTO from "../dtos/ICreateCustomerDTO";
import ICreateTransactionDTO from "../dtos/ICreateTransactionDTO";
import { IListTransactionsDTO } from "../dtos/IListTransactionsDTO";
import { IPayWithCreditCardDTO } from "../dtos/IPayWithCreditCardDTO";
import IPaymentGatewayProvider from "../models/IPaymentGatewayProvider";
import { ITransactionResponse } from "../interfaces/ITransactionResponse";
import { IUpdateSubscriptionDTO } from "../dtos/IUpdateSubscriptionDTO";
import axios from "axios";

export default class PaymentGatewayProvider implements IPaymentGatewayProvider {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = `${process.env.ASAAS_URL}/v3`;
    this.apiKey = process.env.ASAAS_API_KEY as string;
  }

  // ==========================================
  // CUSTOMERS
  // ==========================================

  public async createCustomer({
    name,
    cpfCnpj,
    email,
    phone,
    mobilePhone,
    address,
    addressNumber,
    complement,
    province,
    postalCode,
    externalReference,
    notificationDisabled = true,
    additionalEmails,
    municipalInscription,
    stateInscription,
    observations,
  }: ICreateCustomerDTO): Promise<IAsaasCustomerResponse> {
    const customerData: any = {
      name,
      cpfCnpj: cpfCnpj.replace(/\D/g, ""),
      email: email || undefined,
      phone: phone || undefined,
      mobilePhone: mobilePhone || undefined,
      address: address || undefined,
      addressNumber: addressNumber || undefined,
      complement: complement || undefined,
      province: province || undefined,
      postalCode: postalCode || undefined,
      externalReference: externalReference || undefined,
      notificationDisabled,
      additionalEmails: additionalEmails || undefined,
      municipalInscription: municipalInscription || undefined,
      stateInscription: stateInscription || undefined,
      observations: observations || undefined,
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/customers`,
        customerData,
        {
          headers: { access_token: this.apiKey },
        },
      );

      return response.data;
    } catch (error: any) {
      Sentry.captureException(error, {
        extra: {
          asaasResponse: error?.response?.data,
          httpStatus: error?.response?.status,
          customerData,
        },
      });

      throw new AppError(
        this.formatAsaasError(error) || "Erro ao criar cliente no ASAAS",
      );
    }
  }

  public async findCustomerByCpfCnpj(
    cpfCnpj: string,
  ): Promise<IAsaasCustomerResponse | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/customers`, {
        headers: { access_token: this.apiKey },
        params: { cpfCnpj, limit: 1 },
      });

      if (response.data?.data?.length > 0) {
        return response.data.data[0];
      }

      return null;
    } catch (error: any) {
      return null;
    }
  }

  // ==========================================
  // CREDIT CARDS
  // ==========================================

  public async createCard({
    card_cvv,
    card_expiration_date,
    card_holder_name,
    card_number,
    creditCardHolderInfo,
    remoteIp,
    customerId,
  }: ICreateCardDTO): Promise<IAsaasCreditCardResponse> {
    const cleanDate = card_expiration_date.replace("/", "");

    let expiryMonth: string;
    let expiryYear: string;

    if (cleanDate.length === 4) {
      // MMYY format
      expiryMonth = cleanDate.slice(0, 2);
      expiryYear = `20${cleanDate.slice(2)}`;
    } else if (cleanDate.length === 3) {
      // MYY format
      expiryMonth = cleanDate.slice(0, 1).padStart(2, "0");
      expiryYear = `20${cleanDate.slice(1)}`;
    } else {
      throw new AppError("Formato de data de expiração inválido");
    }

    // Se customerId não foi fornecido, criar um novo customer
    let asaasCustomerId = customerId;

    if (!asaasCustomerId) {
      const customerData = {
        name: creditCardHolderInfo.name,
        cpfCnpj: creditCardHolderInfo.cpfCnpj,
      };

      const createdCustomer = await this.createCustomer(customerData);
      asaasCustomerId = createdCustomer.id;
    }

    try {
      const response = await axios.post<IAsaasCreditCardResponse>(
        `${this.baseUrl}/creditCard/tokenizeCreditCard`,
        {
          customer: asaasCustomerId,
          creditCard: {
            holderName: card_holder_name,
            number: card_number.replace(/\s/g, ""),
            expiryMonth,
            expiryYear,
            ccv: card_cvv,
          },
          creditCardHolderInfo,
          remoteIp,
        },
        {
          headers: { access_token: this.apiKey },
        },
      );

      return response.data;
    } catch (error: any) {
      Sentry.captureException(error, {
        extra: {
          asaasResponse: error?.response?.data,
          httpStatus: error?.response?.status,
          customerId: asaasCustomerId,
          holderName: card_holder_name,
          lastDigits: card_number.slice(-4),
        },
      });

      throw new AppError(
        this.formatAsaasError(error) || "Erro ao tokenizar cartão no ASAAS",
      );
    }
  }

  // ==========================================
  // TRANSACTIONS / PAYMENTS
  // ==========================================

  public async createTransaction({
    asaasCustomerId,
    paymentMethod,
    amount,
    dueDate,
    description,
    daysAfterDueDateToRegistrationCancellation,
    externalReference,
    installmentCount,
    installmentTotalValue,
    installmentValue,
    discount,
    interest,
    fine,
    postalService,
    split,
    callback,
    creditCardToken,
    installment,
    subscription,
  }: ICreateTransactionDTO): Promise<ITransactionResponse> {
    try {
      const formattedDueDate = dueDate
        ? dueDate.toISOString().split("T")[0]
        : undefined;

      const paymentData: any = {
        customer: asaasCustomerId,
        billingType: paymentMethod,
        value: amount,
        dueDate: formattedDueDate,
        creditCardToken: creditCardToken || undefined,
        description: description || undefined,
        daysAfterDueDateToRegistrationCancellation:
          daysAfterDueDateToRegistrationCancellation || undefined,
        externalReference: externalReference || undefined,
        postalService: postalService || undefined,
        installmentCount:
          installmentCount && installmentCount > 1
            ? installmentCount
            : undefined,
        discount: discount || undefined,
        interest: interest || undefined,
        fine: fine || undefined,
        split: split || undefined,
        callback: callback || undefined,
        installmentTotalValue: installmentTotalValue || undefined,
        installmentValue: installmentValue || undefined,
        installment: installment || undefined,
        subscription: subscription || undefined,
      };

      const response = await axios.post<ITransactionResponse>(
        `${this.baseUrl}/payments`,
        paymentData,
        {
          headers: { access_token: this.apiKey },
        },
      );

      return response.data;
    } catch (error: any) {
      Sentry.captureException(error, {
        extra: {
          asaasResponse: error?.response?.data,
          httpStatus: error?.response?.status,
          customerId: asaasCustomerId,
          paymentMethod,
          amount,
        },
      });

      throw new AppError(
        this.formatAsaasError(error) || "Erro ao criar transação no ASAAS",
      );
    }
  }

  public async retrieveTransaction(id: string): Promise<ITransactionResponse> {
    try {
      const response = await axios.get<ITransactionResponse>(
        `${this.baseUrl}/payments/${id}`,
        {
          headers: { access_token: this.apiKey },
        },
      );

      return response.data;
    } catch (error: any) {
      Sentry.captureException(error, {
        extra: {
          asaasResponse: error?.response?.data,
          httpStatus: error?.response?.status,
          transactionId: id,
        },
      });

      throw new AppError(
        this.formatAsaasError(error) || "Transação não encontrada no ASAAS",
      );
    }
  }

  public async listTransactions(filters?: IListTransactionsDTO): Promise<any> {
    try {
      const params = this.buildFilterParams(filters);

      const response = await axios.get(`${this.baseUrl}/payments`, {
        headers: { access_token: this.apiKey },
        params,
      });

      return response.data;
    } catch (error: any) {
      Sentry.captureException(error, {
        extra: {
          asaasResponse: error?.response?.data,
          httpStatus: error?.response?.status,
          filters,
        },
      });

      throw new AppError(
        this.formatAsaasError(error) || "Erro ao listar transações no ASAAS",
      );
    }
  }

  public async deletePayment(
    paymentId: string,
  ): Promise<{ deleted: boolean; id: string }> {
    try {
      const response = await axios.delete<{ deleted: boolean; id: string }>(
        `${this.baseUrl}/payments/${paymentId}`,
        {
          headers: { access_token: this.apiKey },
        },
      );

      return response.data;
    } catch (error: any) {
      Sentry.captureException(error, {
        tags: {
          service: "PaymentGatewayProvider",
          operation: "delete_payment",
        },
        extra: {
          paymentId,
          asaasResponse: error?.response?.data,
          httpStatus: error?.response?.status,
        },
      });

      return { deleted: false, id: paymentId };
    }
  }

  public async payWithCreditCard({
    paymentId,
    creditCard,
    creditCardToken,
    creditCardHolderInfo,
    remoteIp,
  }: IPayWithCreditCardDTO): Promise<ITransactionResponse> {
    try {
      const paymentData: any = {
        creditCard: creditCard || undefined,
        creditCardToken: creditCardToken || undefined,
        creditCardHolderInfo: creditCardHolderInfo || undefined,
        remoteIp,
      };

      const response = await axios.post<ITransactionResponse>(
        `${this.baseUrl}/payments/${paymentId}/payWithCreditCard`,
        paymentData,
        {
          headers: { access_token: this.apiKey },
        },
      );

      return response.data;
    } catch (error: any) {
      Sentry.captureException(error, {
        extra: {
          asaasResponse: error?.response?.data,
          httpStatus: error?.response?.status,
          paymentId,
          hasCreditCard: !!creditCard,
          hasCreditCardToken: !!creditCardToken,
        },
      });

      throw new AppError(
        this.formatAsaasError(error) ||
          "Erro ao pagar cobrança com cartão de crédito no ASAAS",
      );
    }
  }

  // ==========================================
  // PIX
  // ==========================================

  public async getPixQrCode(paymentId: string): Promise<{
    encodedImage: string;
    payload: string;
    expirationDate: string;
  }> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/payments/${paymentId}/pixQrCode`,
        {
          headers: { access_token: this.apiKey },
        },
      );

      return response.data;
    } catch (error: any) {
      Sentry.captureException(error, {
        extra: {
          asaasResponse: error?.response?.data,
          httpStatus: error?.response?.status,
          paymentId,
        },
      });

      throw new AppError(
        this.formatAsaasError(error) || "Erro ao obter QR Code PIX do ASAAS",
      );
    }
  }

  // ==========================================
  // BOLETO
  // ==========================================

  public async getBillBarcode(paymentId: string): Promise<{
    identificationField: string;
  }> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/payments/${paymentId}/identificationField`,
        {
          headers: { access_token: this.apiKey },
        },
      );

      return response.data;
    } catch (error: any) {
      Sentry.captureException(error, {
        extra: {
          asaasResponse: error?.response?.data,
          httpStatus: error?.response?.status,
          paymentId,
        },
      });

      throw new AppError(
        this.formatAsaasError(error) ||
          "Erro ao obter código de barras do boleto do ASAAS",
      );
    }
  }

  // ==========================================
  // SUBSCRIPTIONS
  // ==========================================

  public async retrieveSubscription(
    subscriptionId: string,
  ): Promise<IAsaasSubscriptionResponse> {
    try {
      const response = await axios.get<IAsaasSubscriptionResponse>(
        `${this.baseUrl}/subscriptions/${subscriptionId}`,
        {
          headers: { access_token: this.apiKey },
        },
      );

      return response.data;
    } catch (error: any) {
      Sentry.captureException(error, {
        extra: {
          asaasResponse: error?.response?.data,
          httpStatus: error?.response?.status,
          subscriptionId,
        },
      });

      throw new AppError(
        this.formatAsaasError(error) || "Erro ao recuperar assinatura do ASAAS",
      );
    }
  }

  public async updateSubscription({
    subscriptionId,
    billingType,
    value,
    nextDueDate,
    discount,
    interest,
    fine,
    cycle,
    description,
    endDate,
    maxPayments,
    externalReference,
    creditCard,
    creditCardToken,
    creditCardHolderInfo,
    remoteIp,
    updatePendingPayments,
  }: IUpdateSubscriptionDTO): Promise<IAsaasSubscriptionResponse> {
    try {
      const updateData: any = {
        billingType: billingType || undefined,
        value: value !== undefined ? value : undefined,
        nextDueDate: nextDueDate || undefined,
        discount: discount || undefined,
        interest: interest || undefined,
        fine: fine || undefined,
        cycle: cycle || undefined,
        description: description || undefined,
        endDate: endDate || undefined,
        maxPayments: maxPayments || undefined,
        externalReference: externalReference || undefined,
        creditCard: creditCard || undefined,
        creditCardToken: creditCardToken || undefined,
        creditCardHolderInfo: creditCardHolderInfo || undefined,
        remoteIp: remoteIp || undefined,
        updatePendingPayments:
          updatePendingPayments !== undefined
            ? updatePendingPayments
            : undefined,
      };

      const response = await axios.put<IAsaasSubscriptionResponse>(
        `${this.baseUrl}/subscriptions/${subscriptionId}`,
        updateData,
        {
          headers: { access_token: this.apiKey },
        },
      );

      return response.data;
    } catch (error: any) {
      Sentry.captureException(error, {
        extra: {
          asaasResponse: error?.response?.data,
          httpStatus: error?.response?.status,
          subscriptionId,
          updateData: { billingType, nextDueDate, updatePendingPayments },
        },
      });

      throw new AppError(
        this.formatAsaasError(error) || "Erro ao atualizar assinatura no ASAAS",
      );
    }
  }

  // ==========================================
  // PRIVATE HELPERS
  // ==========================================

  private buildFilterParams(
    filters?: IListTransactionsDTO,
  ): Record<string, any> {
    const params: Record<string, any> = {};

    if (filters) {
      if (filters.installment) params.installment = filters.installment;
      if (filters.offset !== undefined) params.offset = filters.offset;
      if (filters.limit !== undefined) {
        params.limit = Math.min(filters.limit, 100);
      }
      if (filters.customer) params.customer = filters.customer;
      if (filters.customerGroupName)
        params.customerGroupName = filters.customerGroupName;
      if (filters.billingType) params.billingType = filters.billingType;
      if (filters.status) params.status = filters.status;
      if (filters.subscription) params.subscription = filters.subscription;
      if (filters.externalReference)
        params.externalReference = filters.externalReference;
      if (filters.paymentDate) params.paymentDate = filters.paymentDate;
      if (filters.invoiceStatus) params.invoiceStatus = filters.invoiceStatus;
      if (filters.estimatedCreditDate)
        params.estimatedCreditDate = filters.estimatedCreditDate;
      if (filters.pixQrCodeId) params.pixQrCodeId = filters.pixQrCodeId;
      if (filters.anticipated !== undefined)
        params.anticipated = filters.anticipated;
      if (filters.anticipable !== undefined)
        params.anticipable = filters.anticipable;
      if (filters.user) params.user = filters.user;

      // Date range filters
      if (filters["dateCreated[ge]"])
        params["dateCreated[ge]"] = filters["dateCreated[ge]"];
      if (filters["dateCreated[le]"])
        params["dateCreated[le]"] = filters["dateCreated[le]"];
      if (filters["paymentDate[ge]"])
        params["paymentDate[ge]"] = filters["paymentDate[ge]"];
      if (filters["paymentDate[le]"])
        params["paymentDate[le]"] = filters["paymentDate[le]"];
      if (filters["estimatedCreditDate[ge]"])
        params["estimatedCreditDate[ge]"] = filters["estimatedCreditDate[ge]"];
      if (filters["estimatedCreditDate[le]"])
        params["estimatedCreditDate[le]"] = filters["estimatedCreditDate[le]"];
      if (filters["dueDate[ge]"])
        params["dueDate[ge]"] = filters["dueDate[ge]"];
      if (filters["dueDate[le]"])
        params["dueDate[le]"] = filters["dueDate[le]"];
    }

    if (!params.limit) params.limit = 20;
    if (!params.offset) params.offset = 0;

    return params;
  }

  private formatAsaasError(error: any): string | null {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 400) {
        const errors = error.response?.data.errors;
        const errorsDescriptions = errors.map((e: any) => e.description);
        return `invalid-fields::${errorsDescriptions.join("||")}`;
      }
    }
    return null;
  }
}
