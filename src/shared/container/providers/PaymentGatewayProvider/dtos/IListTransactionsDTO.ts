export type TBillingType = "UNDEFINED" | "BOLETO" | "CREDIT_CARD" | "PIX";

export type TInvoiceStatus =
  | "SCHEDULED"
  | "AUTHORIZED"
  | "PROCESSING_CANCELLATION"
  | "CANCELED"
  | "CANCELLATION_DENIED"
  | "ERROR";

export interface IListTransactionsDTO {
  installment?: string;
  offset?: number;
  limit?: number;
  customer?: string;
  customerGroupName?: string;
  billingType?: TBillingType;
  status?: string;
  subscription?: string;
  externalReference?: string;
  paymentDate?: string;
  invoiceStatus?: TInvoiceStatus;
  estimatedCreditDate?: string;
  pixQrCodeId?: string;
  anticipated?: boolean;
  anticipable?: boolean;
  user?: string;
  "dateCreated[ge]"?: string;
  "dateCreated[le]"?: string;
  "paymentDate[ge]"?: string;
  "paymentDate[le]"?: string;
  "estimatedCreditDate[ge]"?: string;
  "estimatedCreditDate[le]"?: string;
  "dueDate[ge]"?: string;
  "dueDate[le]"?: string;
}
