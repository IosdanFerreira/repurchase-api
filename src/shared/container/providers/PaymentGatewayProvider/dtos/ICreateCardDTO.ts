interface ICreditCardHolderInfo {
  name: string;
  email: string;
  cpfCnpj: string;
  postalCode: string;
  addressNumber: string;
  addressComplement?: string | null;
  phone: string;
  mobilePhone?: string;
}

export default interface ICreateCardDTO {
  card_number: string;
  card_expiration_date: string; // Formato: MM/YY ou MMYY
  card_holder_name: string;
  card_cvv: string;
  creditCardHolderInfo: ICreditCardHolderInfo;
  remoteIp: string;
  customerId?: string; // Se fornecido, usa este customer ao invés de criar um novo
}
