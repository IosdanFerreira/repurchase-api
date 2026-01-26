export default function formatWhatsAppNumber(
  phoneNumber: string | null | undefined,
): string {
  if (!phoneNumber) {
    return "";
  }

  const cleaned = phoneNumber.replace(/\D/g, "");

  if (cleaned.length === 13 && cleaned.startsWith("55")) {
    const ddd = cleaned.substring(2, 4);
    const firstPart = cleaned.substring(4, 9);
    const secondPart = cleaned.substring(9);
    return `(${ddd}) ${firstPart}-${secondPart}`;
  }

  if (cleaned.length === 11) {
    const ddd = cleaned.substring(0, 2);
    const firstPart = cleaned.substring(2, 7);
    const secondPart = cleaned.substring(7);
    return `(${ddd}) ${firstPart}-${secondPart}`;
  }

  return phoneNumber;
}
