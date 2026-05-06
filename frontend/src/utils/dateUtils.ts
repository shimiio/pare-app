// convert from YYYY - MM - DD to DD Month YYYY format
export const readableDate = (dateString: string): string => {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// get the number of days between two dates
export const getDaysUtil = (date: string): number => {
  const today = new Date();
  const target = new Date(date);

  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return diffDays;
};

// get label color from day number
export const getLabelColor = (days: number) => {
  if (days <= 3) return "bg-red-500/20 text-red-400";
  if (days <= 7) return "bg-yellow-500/20 text-yellow-400";
  return "bg-green-500/20 text-green-400";
};
