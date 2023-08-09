export const normalizeName = (name: string) => {
  const nameNormalized = name
    .trimStart()
    .trimEnd()
    .replace("/", "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace("|", "")
    .replace('"', "")
    .replace('"', "")
    .replace("®", "")
    .replace(/\s/g, "-")
    .replace(":", "-")
    .replace(":", "-")
    .replace("?", "")
    .replace("¿", "");
  return nameNormalized;
};
