/**
 * Formats a numeric amount into standard Tunisian Dinar format:
 * "129 TND", "16 420 TND", "+60.4 TND", "-3 980 TND"
 */
export function formatMoney(
  amount: number,
  options?: {
    showSign?: boolean;
    decimals?: number;
    suffix?: string;
  }
): string {
  const { showSign = false, decimals, suffix = " TND" } = options || {};

  if (isNaN(amount) || !isFinite(amount)) {
    return `0${suffix}`;
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  let formattedNumber: string;
  if (decimals !== undefined) {
    formattedNumber = absAmount.toFixed(decimals);
  } else {
    // If integer, don't show decimals. If has decimal part, show up to 1 or 2 decimals
    if (Number.isInteger(absAmount)) {
      formattedNumber = absAmount.toString();
    } else {
      formattedNumber = absAmount.toFixed(1).replace(/\.0$/, "");
    }
  }

  // Format integer part with space as thousands separator
  const parts = formattedNumber.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const withSpaces = parts.join(".");

  let prefix = "";
  if (isNegative) {
    prefix = "-";
  } else if (showSign && amount > 0) {
    prefix = "+";
  }

  return `${prefix}${withSpaces}${suffix}`;
}

export function formatMillimes(
  millimes: number,
  options?: {
    showSign?: boolean;
    decimals?: number;
    suffix?: string;
  }
): string {
  if (isNaN(millimes) || !isFinite(millimes)) {
    return `0${options?.suffix ?? ' TND'}`;
  }
  return formatMoney(millimes / 1000, options);
}

/**
 * Formats percentages like "42.3%" or "+42.3%"
 */
export function formatPercent(
  value: number,
  options?: { showSign?: boolean; decimals?: number }
): string {
  const { showSign = false, decimals = 1 } = options || {};
  const isNegative = value < 0;
  const absVal = Math.abs(value);
  const formatted = absVal.toFixed(decimals);

  let prefix = "";
  if (isNegative) {
    prefix = "-";
  } else if (showSign && value > 0) {
    prefix = "+";
  }

  return `${prefix}${formatted}%`;
}
