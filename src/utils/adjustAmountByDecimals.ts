export const adjustAmountByDecimals = (
  amount: number,
  decimals: number | undefined,
): string => {
  const defaultDecimals = 7;
  const actualDecimals = decimals ?? defaultDecimals;

  let amountStr = amount.toString();

  while (amountStr.length <= actualDecimals) {
    amountStr = '0' + amountStr;
  }

  const integerPart = amountStr.slice(0, -actualDecimals);
  const decimalPart = amountStr.slice(-actualDecimals);
  const result = integerPart + '.' + decimalPart;

  return result.replace(/(\.\d*[1-9])0+$|\.0*$/, '$1');
};
