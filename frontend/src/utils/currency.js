import API from "../services/api";

// Currency conversion utility (USD base) using live FX rates.
const FALLBACK_USD_TO_INR_RATE = 83;

const RATE_CACHE_KEY = "bugsecure_fx_usd_to_inr_rate";
const RATE_CACHE_TS_KEY = "bugsecure_fx_usd_to_inr_rate_ts";

// Mutable module-level cache to keep formatting functions synchronous.
let usdToInrRate = (() => {
  const raw = localStorage.getItem(RATE_CACHE_KEY);
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) && n > 0 ? n : FALLBACK_USD_TO_INR_RATE;
})();

const getUsdToInrRate = () => {
  const raw = localStorage.getItem(RATE_CACHE_KEY);
  const n = raw ? Number(raw) : NaN;
  if (Number.isFinite(n) && n > 0) {
    usdToInrRate = n;
    return usdToInrRate;
  }
  return usdToInrRate || FALLBACK_USD_TO_INR_RATE;
};

export const initFxRates = async () => {
  try {
    // Use cached rate if it is fresh (< 30 minutes).
    const tsRaw = localStorage.getItem(RATE_CACHE_TS_KEY);
    const ts = tsRaw ? Number(tsRaw) : 0;
    const ageMs = Date.now() - ts;
    if (ts > 0 && ageMs >= 0 && ageMs < 30 * 60 * 1000 && usdToInrRate > 0) {
      return;
    }

    const res = await API.get(
      "/api/currency/rates",
      { params: { base: "USD", symbols: "INR,USD" } }
    );

    const rates = res.data?.rates || {};
    const inrRate = Number(rates?.INR);
    if (Number.isFinite(inrRate) && inrRate > 0) {
      usdToInrRate = inrRate;
      localStorage.setItem(RATE_CACHE_KEY, String(inrRate));
      localStorage.setItem(RATE_CACHE_TS_KEY, String(Date.now()));
    }
  } catch (e) {
    // Silent fallback to cached or hardcoded approximation.
  }
};

export const convertUSDToINR = (usdAmount) => {
  if (usdAmount === null || usdAmount === undefined || isNaN(usdAmount)) return 0;
  const rate = getUsdToInrRate();
  const num = parseFloat(usdAmount);
  if (!Number.isFinite(num)) return 0;
  return Math.round(num * rate * 100) / 100;
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
    inr: `₹${inr.toFixed(2)}`
  };
};

export { getUsdToInrRate };













