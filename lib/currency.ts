// Supported currencies with their symbols and formatting
export const SUPPORTED_CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar', symbolPosition: 'before' as const },
  EUR: { symbol: '€', name: 'Euro', symbolPosition: 'before' as const },
  GBP: {
    symbol: '£',
    name: 'British Pound',
    symbolPosition: 'before' as const,
  },
  CAD: {
    symbol: '$',
    name: 'Canadian Dollar',
    symbolPosition: 'before' as const,
  },
  AUD: {
    symbol: '$',
    name: 'Australian Dollar',
    symbolPosition: 'before' as const,
  },
  JPY: { symbol: '¥', name: 'Japanese Yen', symbolPosition: 'before' as const },
  CNY: { symbol: '¥', name: 'Chinese Yuan', symbolPosition: 'before' as const },
  INR: { symbol: '₹', name: 'Indian Rupee', symbolPosition: 'before' as const },
  MXN: { symbol: '$', name: 'Mexican Peso', symbolPosition: 'before' as const },
  BRL: {
    symbol: 'R$',
    name: 'Brazilian Real',
    symbolPosition: 'before' as const,
  },
  CHF: { symbol: 'CHF', name: 'Swiss Franc', symbolPosition: 'after' as const },
  HKD: {
    symbol: '$',
    name: 'Hong Kong Dollar',
    symbolPosition: 'before' as const,
  },
  SGD: {
    symbol: '$',
    name: 'Singapore Dollar',
    symbolPosition: 'before' as const,
  },
  KRW: {
    symbol: '₩',
    name: 'South Korean Won',
    symbolPosition: 'before' as const,
  },
  SEK: {
    symbol: 'kr',
    name: 'Swedish Krona',
    symbolPosition: 'after' as const,
  },
  NOK: {
    symbol: 'kr',
    name: 'Norwegian Krone',
    symbolPosition: 'after' as const,
  },
  DKK: { symbol: 'kr', name: 'Danish Krone', symbolPosition: 'after' as const },
  NZD: {
    symbol: '$',
    name: 'New Zealand Dollar',
    symbolPosition: 'before' as const,
  },
  ZAR: {
    symbol: 'R',
    name: 'South African Rand',
    symbolPosition: 'before' as const,
  },
  RUB: { symbol: '₽', name: 'Russian Ruble', symbolPosition: 'after' as const },
  PKR: {
    symbol: '₨',
    name: 'Pakistani Rupee',
    symbolPosition: 'before' as const,
  },
} as const

export type CurrencyCode = keyof typeof SUPPORTED_CURRENCIES

// Format a number as currency
export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'USD',
  options?: {
    hideSymbol?: boolean
    compact?: boolean
  },
): string {
  const currencyInfo =
    SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.USD
  const { symbol, symbolPosition } = currencyInfo

  if (options?.hideSymbol) {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const formattedNumber = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  if (symbolPosition === 'before') {
    return `${symbol}${formattedNumber}`
  } else {
    return `${formattedNumber} ${symbol}`
  }
}

// Parse a currency string to a number
export function parseCurrency(value: string): number {
  // Remove currency symbols and whitespace
  const cleaned = value.replace(/[^0-9.-]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

// Currency conversion rates (these would typically come from an API)
// For now, we'll use static rates that can be updated
let exchangeRates: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  AUD: 1.53,
  JPY: 149.5,
  CNY: 7.24,
  INR: 83.12,
  MXN: 17.15,
  BRL: 4.97,
  CHF: 0.88,
  HKD: 7.82,
  SGD: 1.34,
  KRW: 1320.5,
  SEK: 10.42,
  NOK: 10.68,
  DKK: 6.87,
  NZD: 1.64,
  ZAR: 18.65,
  RUB: 92.5,
  PKR: 278.5,
}

// Update exchange rates from API
export async function updateExchangeRates(
  baseCurrency: CurrencyCode = 'USD',
): Promise<void> {
  try {
    // Using exchangerate-api.com free tier (or similar)
    const apiKey = process.env.EXCHANGE_RATE_API_KEY
    if (!apiKey) {
      console.warn('Exchange rate API key not configured, using static rates')
      return
    }

    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`,
    )

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates')
    }

    const data = await response.json()

    // Update rates
    for (const [currency, rate] of Object.entries(data.rates)) {
      if (currency in SUPPORTED_CURRENCIES) {
        exchangeRates[currency as CurrencyCode] = rate as number
      }
    }
  } catch (error) {
    console.error('Error updating exchange rates:', error)
  }
}

// Convert amount from one currency to another
export function convertCurrency(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
): number {
  if (fromCurrency === toCurrency) {
    return amount
  }

  const fromRate = exchangeRates[fromCurrency] || 1
  const toRate = exchangeRates[toCurrency] || 1

  // Convert to USD first, then to target currency
  const usdAmount = amount / fromRate
  return usdAmount * toRate
}

// Get exchange rate between two currencies
export function getExchangeRate(
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
): number {
  if (fromCurrency === toCurrency) {
    return 1
  }

  const fromRate = exchangeRates[fromCurrency] || 1
  const toRate = exchangeRates[toCurrency] || 1

  return toRate / fromRate
}

// Get all currency options for a select dropdown
export function getCurrencyOptions(): Array<{
  value: CurrencyCode
  label: string
}> {
  return Object.entries(SUPPORTED_CURRENCIES).map(([code, info]) => ({
    value: code as CurrencyCode,
    label: `${code} - ${info.name}`,
  }))
}

// Detect currency from text (e.g., receipt OCR)
export function detectCurrencyFromText(text: string): CurrencyCode {
  const upperText = text.toUpperCase()

  // Check for explicit currency codes
  for (const code of Object.keys(SUPPORTED_CURRENCIES) as CurrencyCode[]) {
    if (upperText.includes(code)) {
      return code
    }
  }

  // Check for currency symbols
  if (upperText.includes('£')) return 'GBP'
  if (upperText.includes('€')) return 'EUR'
  if (upperText.includes('¥')) {
    // Could be JPY or CNY - check for context
    if (
      upperText.includes('JPY') ||
      upperText.includes('JAPAN') ||
      upperText.includes('YEN')
    ) {
      return 'JPY'
    }
    if (
      upperText.includes('CNY') ||
      upperText.includes('CHINA') ||
      upperText.includes('YUAN')
    ) {
      return 'CNY'
    }
    return 'JPY' // Default to JPY for ¥ symbol
  }
  if (upperText.includes('₹')) return 'INR'
  if (upperText.includes('₩')) return 'KRW'
  if (upperText.includes('₽')) return 'RUB'
  if (upperText.includes('₨')) return 'PKR'
  if (upperText.includes('R$')) return 'BRL'

  // Check for currency names
  if (upperText.includes('DOLLAR') || upperText.includes('USD')) {
    if (upperText.includes('AUSTRALIAN') || upperText.includes('AUD'))
      return 'AUD'
    if (upperText.includes('CANADIAN') || upperText.includes('CAD'))
      return 'CAD'
    if (upperText.includes('NEW ZEALAND') || upperText.includes('NZD'))
      return 'NZD'
    if (upperText.includes('SINGAPORE') || upperText.includes('SGD'))
      return 'SGD'
    if (upperText.includes('HONG KONG') || upperText.includes('HKD'))
      return 'HKD'
    return 'USD'
  }
  if (upperText.includes('EURO')) return 'EUR'
  if (upperText.includes('POUND') || upperText.includes('STERLING'))
    return 'GBP'
  if (upperText.includes('PESO')) {
    if (upperText.includes('MEXICAN') || upperText.includes('MXN')) return 'MXN'
  }
  if (upperText.includes('RUPEE')) {
    if (upperText.includes('PAKISTANI') || upperText.includes('PKR'))
      return 'PKR'
    return 'INR'
  }
  if (upperText.includes('WON')) return 'KRW'
  if (upperText.includes('YUAN') || upperText.includes('RENMINBI')) return 'CNY'
  if (upperText.includes('YEN')) return 'JPY'

  // Default to USD
  return 'USD'
}
