export const formatCurrency = (
  amount: number | undefined,
  currencyCode: string,
) => {
  if (amount === undefined || amount === null) {
    return "-";
  }

  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: currencyCode,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 0,
  }).format(amount);
};

// convert service URL to the domain
export const getDomain = (url: string) => {
  try {
    const withProtocol = url.startsWith("http") ? url : `https://${url}`;
    return new URL(withProtocol).hostname.replace("www", "");
  } catch {
    return url;
  }
};
