export interface IAsaasSubscriptionDiscount {
  value: number;
  dueDateLimitDays: number;
  type?: "FIXED" | "PERCENTAGE";
}

export interface IAsaasSubscriptionFine {
  value: number;
  type?: "FIXED" | "PERCENTAGE";
}

export interface IAsaasSubscriptionInterest {
  value: number;
  type?: "PERCENTAGE";
}

export interface IAsaasSubscriptionCreditCard {
  creditCardNumber: string;
  creditCardBrand: string;
  creditCardToken: string;
}

export interface IAsaasSubscriptionResponse {
  object: "subscription";
  id: string;
  dateCreated: string;
  customer: string;
  paymentLink: string | null;
  billingType: "BOLETO" | "CREDIT_CARD" | "PIX" | "UNDEFINED";
  value: number;
  nextDueDate: string;
  cycle:
    | "WEEKLY"
    | "BIWEEKLY"
    | "MONTHLY"
    | "QUARTERLY"
    | "SEMIANNUALLY"
    | "YEARLY";
  description: string;
  endDate: string | null;
  maxPayments: number | null;
  status: "ACTIVE" | "EXPIRED" | "INACTIVE";
  externalReference: string | null;
  split: any | null;
  discount?: IAsaasSubscriptionDiscount;
  fine?: IAsaasSubscriptionFine;
  interest?: IAsaasSubscriptionInterest;
  creditCard?: IAsaasSubscriptionCreditCard;
  deleted: boolean;
}
