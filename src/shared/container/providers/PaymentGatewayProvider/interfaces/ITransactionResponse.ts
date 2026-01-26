import { TDiscountType, TPaymentMethodType, TPaymentStatus } from "../types";

import { IFine } from "./IPaymentFine";

interface IDiscount {
  value: number;
  limitDate: string | null;
  dueDateLimitDays: number;
  type: TDiscountType;
}

interface IInterest {
  value: number;
  type: TDiscountType;
}

export interface ITransactionResponse {
  id: string;
  object: "payment";
  dateCreated: string;
  customer: string;
  checkoutSession: string | null;
  paymentLink: string | null;
  value: number;
  netValue: number;
  originalValue: number | null;
  interestValue: number | null;
  description: string | null;
  billingType: TPaymentMethodType;
  confirmedDate: string | null;
  creditCard: any | null;
  pixTransaction: string | null;
  status: TPaymentStatus;
  dueDate: string;
  originalDueDate: string;
  paymentDate: string | null;
  clientPaymentDate: string | null;
  installmentNumber: number | null;
  invoiceUrl: string;
  invoiceNumber: string;
  externalReference: string | null;
  deleted: boolean;
  anticipated: boolean;
  anticipable: boolean;
  creditDate: string | null;
  estimatedCreditDate: string | null;
  transactionReceiptUrl: string | null;
  nossoNumero: string | null;
  bankSlipUrl: string | null;
  lastInvoiceViewedDate: string | null;
  lastBankSlipViewedDate: string | null;
  discount: IDiscount;
  fine: IFine;
  interest: IInterest;
  postalService: boolean;
  escrow: any | null;
  refunds: any | null;
}
