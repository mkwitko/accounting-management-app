export const formatDecimalInput = (text: string) => {
  // Remove tudo que não seja número
  let numericText = text.replace(/[^0-9]/g, "");

  // Converte para número e divide por 100 para formar casas decimais
  let numberValue = Number(numericText) / 100;

  // Formata com separador de milhar e duas casas decimais
  const formatted = numberValue.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatted;
};

export const formatIntegerInput = (text: string) => {
  // Remove tudo que não seja número
  let numericText = text.replace(/[^0-9]/g, "");

  // Formata com separador de milhar
  const formatted = Number(numericText).toLocaleString("pt-BR");
  return formatted;
};
