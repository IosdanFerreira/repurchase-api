import AppError from "@shared/errors/AppError";

export default function normalizePhoneNumberForWebWhatsApp(
  phoneNumber: string | null | undefined,
  defaultCountryCode = "55",
): string {
  if (!phoneNumber) {
    throw new AppError("Número de telefone é obrigatório");
  }

  let cleanedNumber = phoneNumber.replace(/\D/g, "");

  if (!cleanedNumber) {
    throw new AppError("Número de telefone inválido");
  }

  cleanedNumber = cleanedNumber.replace(/^0+/, "");

  let finalNumber = cleanedNumber;

  if (
    cleanedNumber.startsWith(defaultCountryCode) &&
    cleanedNumber.length >= 12
  ) {
    const numberWithoutDDI = cleanedNumber.substring(defaultCountryCode.length);

    if (numberWithoutDDI.length === 10) {
      const ddd = numberWithoutDDI.substring(0, 2);
      const number = numberWithoutDDI.substring(2);
      finalNumber = `${defaultCountryCode}${ddd}9${number}`;
    } else if (numberWithoutDDI.length === 11) {
      finalNumber = cleanedNumber;
    }
  } else if (cleanedNumber.length === 10 || cleanedNumber.length === 11) {
    if (cleanedNumber.length === 10) {
      const ddd = cleanedNumber.substring(0, 2);
      const number = cleanedNumber.substring(2);
      finalNumber = `${defaultCountryCode}${ddd}9${number}`;
    } else {
      finalNumber = `${defaultCountryCode}${cleanedNumber}`;
    }
  }

  return finalNumber;
}
