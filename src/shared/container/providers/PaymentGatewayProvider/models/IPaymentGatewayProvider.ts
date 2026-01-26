import { IAsaasCreditCardResponse } from "../interfaces/IAsaasCreditCardResponse";
import { IAsaasCustomerResponse } from "../interfaces/IAsaasCustomerResponse";
import { IAsaasSubscriptionResponse } from "../interfaces/IAsaasSubscriptionResponse";
import ICreateCardDTO from "../dtos/ICreateCardDTO";
import ICreateCustomerDTO from "../dtos/ICreateCustomerDTO";
import ICreateTransactionDTO from "../dtos/ICreateTransactionDTO";
import { IListTransactionsDTO } from "../dtos/IListTransactionsDTO";
import { IPayWithCreditCardDTO } from "../dtos/IPayWithCreditCardDTO";
import { ITransactionResponse } from "../interfaces/ITransactionResponse";
import { IUpdateSubscriptionDTO } from "../dtos/IUpdateSubscriptionDTO";

export default interface IPaymentGatewayProvider {
  // ===== CUSTOMERS =====
  createCustomer(data: ICreateCustomerDTO): Promise<IAsaasCustomerResponse>;
  findCustomerByCpfCnpj(
    cpfCnpj: string,
  ): Promise<IAsaasCustomerResponse | null>;

  // ===== CREDIT CARDS =====
  createCard(data: ICreateCardDTO): Promise<IAsaasCreditCardResponse>;

  // ===== TRANSACTIONS/PAYMENTS =====
  createTransaction(data: ICreateTransactionDTO): Promise<ITransactionResponse>;
  retrieveTransaction(id: string): Promise<ITransactionResponse>;
  listTransactions(filters?: IListTransactionsDTO): Promise<any>;
  deletePayment(paymentId: string): Promise<{ deleted: boolean; id: string }>;
  payWithCreditCard(data: IPayWithCreditCardDTO): Promise<ITransactionResponse>;

  // ===== PIX =====
  getPixQrCode(paymentId: string): Promise<{
    payload: string;
    encodedImage: string;
    expirationDate: string;
  }>;

  // ===== BOLETO =====
  getBillBarcode(paymentId: string): Promise<{ identificationField: string }>;

  // ===== SUBSCRIPTIONS =====
  retrieveSubscription(
    subscriptionId: string,
  ): Promise<IAsaasSubscriptionResponse>;
  updateSubscription(
    data: IUpdateSubscriptionDTO,
  ): Promise<IAsaasSubscriptionResponse>;
}
