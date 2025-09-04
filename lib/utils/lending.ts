export const formatAmount = (amount: string, decimals = 6) => {
  const num = BigInt(amount) / BigInt(10 ** decimals);
  return num.toString();
};

export const formatTimestamp = (timestamp: string) => {
  return new Date(parseInt(timestamp) * 1000).toLocaleString();
};

export const formatHealthFactor = (hf: string) => {
  const factor = Number(hf) / 1e18;
  return factor.toFixed(2);
};

export const calculateAPY = (apr: string) => {
  const aprNumber = Number(apr) / 100;
  return aprNumber.toFixed(2) + '%';
};

export const formatAmountToETH = (amount: string, decimals = 18) => {
  const value = parseFloat(amount) / Math.pow(10, decimals);
  return value.toFixed(6);
};