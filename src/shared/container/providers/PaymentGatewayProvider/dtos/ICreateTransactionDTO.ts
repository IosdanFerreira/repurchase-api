import { IFine } from "../interfaces/IPaymentFine";
import { TDiscountType } from "../types/TDiscountType";

interface IDiscount {
  value: number;
  dueDateLimitDays: number;
  type: TDiscountType;
}

interface IInterest {
  value: number;
}

interface ICallback {
  successUrl: string;
  autoRedirect?: boolean | null;
}

interface ISplit {
  walletId: string;
  fixedValue?: number | null;
  percentageValue?: number | null;
  totalFixedValue?: number | null;
  externalReference?: string | null;
  description?: string | null;
}

export default interface ICreateTransactionDTO {
  asaasCustomerId: string;
  paymentMethod: string; // 'CREDIT_CARD' | 'PIX' | 'BOLETO'
  amount: number;
  dueDate?: Date;
  description?: string | null;
  daysAfterDueDateToRegistrationCancellation?: number | null;
  externalReference?: string | null;
  installmentCount?: number | null;
  installmentTotalValue?: number | null;
  installmentValue?: number | null;
  discount?: IDiscount | null;
  interest?: IInterest | null;
  fine?: IFine | null;
  postalService?: boolean | null;
  split?: ISplit[] | null;
  callback?: ICallback;
  creditCardToken?: string;
  installment?: string | null;
  subscription?: string | null;
}
