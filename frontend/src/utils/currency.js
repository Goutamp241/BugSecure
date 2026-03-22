// Currency conversion utility
// Exchange rate: 1 USD = 83 INR (approximate, can be updated)
const USD_TO_INR_RATE = 83;

export const convertUSDToINR = (usdAmount) => {
  if (!usdAmount || isNaN(usdAmount)) return 0;
  return (parseFloat(usdAmount) * USD_TO_INR_RATE).toFixed(2);
};

export const formatCurrency = (amount, currency = 'USD') => {
  if (!amount || isNaN(amount)) return '0.00';
  const numAmount = parseFloat(amount);
  
  if (currency === 'INR') {
    return `₹${numAmount.toFixed(2)}`;
  } else {
    return `$${numAmount.toFixed(2)}`;
  }
};

export const formatCurrencyWithConversion = (usdAmount) => {
  if (!usdAmount || isNaN(usdAmount)) return { usd: '$0.00', inr: '₹0.00' };
  const usd = parseFloat(usdAmount);
  const inr = convertUSDToINR(usd);
  return {
    usd: `$${usd.toFixed(2)}`,
    inr: `₹${inr}`
  };
};

export { USD_TO_INR_RATE };













