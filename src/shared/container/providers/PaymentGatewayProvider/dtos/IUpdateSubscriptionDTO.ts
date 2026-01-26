export interface IUpdateSubscriptionCreditCard {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
}

export interface IUpdateSubscriptionDTO {
  subscriptionId: string;
  billingType?: "BOLETO" | "CREDIT_CARD" | "PIX" | "UNDEFINED";
  value?: number;
  nextDueDate?: string;
  discount?: {
    value: number;
    dueDateLimitDays: number;
    type?: "FIXED" | "PERCENTAGE";
  };
  interest?: {
    value: number;
  };
  fine?: {
    value: number;
    type?: "FIXED" | "PERCENTAGE";
  };
  cycle?:
    | "WEEKLY"
    | "BIWEEKLY"
    | "MONTHLY"
    | "QUARTERLY"
    | "SEMIANNUALLY"
    | "YEARLY";
  description?: string;
  endDate?: string;
  maxPayments?: number;
  externalReference?: string;
  creditCard?: IUpdateSubscriptionCreditCard;
  creditCardToken?: string;
  creditCardHolderInfo?: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    addressComplement?: string;
    phone: string;
    mobilePhone?: string;
  };
  remoteIp?: string;
  updatePendingPayments?: boolean;
}
