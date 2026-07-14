import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Cache for exchange rates with timestamp
let exchangeRateCache: {
  rate: number;
  timestamp: number;
  baseCurrency: string;
  targetCurrency: string;
} | null = null;

const CACHE_DURATION = 3600000; // 1 hour in milliseconds

/**
 * Fetch real-time exchange rate from EUR to XAF
 * Uses a free exchange rate API with caching
 */
export async function getExchangeRate(): Promise<number> {
  const now = Date.now();
  
  // Return cached rate if valid
  if (
    exchangeRateCache &&
    exchangeRateCache.baseCurrency === 'EUR' &&
    exchangeRateCache.targetCurrency === 'XAF' &&
    now - exchangeRateCache.timestamp < CACHE_DURATION
  ) {
    return exchangeRateCache.rate;
  }

  try {
    // Using exchangerate-api.com free tier
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/EUR', {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rate');
    }

    const data = await response.json();
    const rate = data.rates.XAF;

    // Update cache
    exchangeRateCache = {
      rate,
      timestamp: now,
      baseCurrency: 'EUR',
      targetCurrency: 'XAF',
    };

    return rate;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    // Fallback to a reasonable default rate (1 EUR ≈ 655 XAF)
    // This can be updated based on your needs
    return 655;
  }
}

/**
 * Convert price from one currency to another
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  if (fromCurrency === 'EUR' && toCurrency === 'XAF') {
    const rate = await getExchangeRate();
    return amount * rate;
  }

  if (fromCurrency === 'XAF' && toCurrency === 'EUR') {
    const rate = await getExchangeRate();
    return amount / rate;
  }

  return amount;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
