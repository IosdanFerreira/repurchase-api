export default function replaceTemplateVariables(
  template: string,
  variables: Record<string, string | number | undefined>,
): string {
  if (!template) {
    return "";
  }

  let result = template;

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    result = result.replace(regex, String(value ?? ""));
  });

  return result;
}
