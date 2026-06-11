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
    if (!url || url.length <= 3) return "";

    const withProtocol = url.startsWith("http") ? url : `https://${url}`;
    const hostname = new URL(withProtocol).hostname;

    return hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};
