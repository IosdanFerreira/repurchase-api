export interface IPayWithCreditCardCreditCard {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
}

export interface IPayWithCreditCardHolderInfo {
  name: string;
  email: string;
  cpfCnpj: string;
  postalCode: string;
  addressNumber: string;
  addressComplement?: string;
  phone: string;
  mobilePhone?: string;
}

export interface IPayWithCreditCardDTO {
  paymentId: string;
  creditCard?: IPayWithCreditCardCreditCard;
  creditCardToken?: string;
  creditCardHolderInfo?: IPayWithCreditCardHolderInfo;
  remoteIp: string;
}
