export const formatMoney = (value: number) => `$${value.toFixed(2)}`;
export const formatTime = (timestamp: number) =>
  new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(timestamp);
export const formatDate = (timestamp: number) =>
  new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(
    timestamp,
  );
export const getTimestamp = () => Date.now();
