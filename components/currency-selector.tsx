'use client'

import { useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SUPPORTED_CURRENCIES, type CurrencyCode } from '@/lib/currency'

interface CurrencySelectorProps {
  value: CurrencyCode
  onChange: (currency: CurrencyCode) => void
  disabled?: boolean
}

export function CurrencySelector({
  value,
  onChange,
  disabled = false,
}: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const currentCurrency =
    SUPPORTED_CURRENCIES[value] || SUPPORTED_CURRENCIES.USD

  // Popular currencies to show first
  const popularCurrencies: CurrencyCode[] = [
    'USD',
    'EUR',
    'GBP',
    'CAD',
    'AUD',
    'JPY',
  ]
  const otherCurrencies = Object.keys(SUPPORTED_CURRENCIES).filter(
    (c) => !popularCurrencies.includes(c as CurrencyCode),
  ) as CurrencyCode[]

  return (
    <div className='relative'>
      <Button
        type='button'
        variant='outline'
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className='min-w-[100px] justify-between'>
        <span className='flex items-center gap-2'>
          <span className='text-lg'>{currentCurrency.symbol}</span>
          <span>{value}</span>
        </span>
        <ChevronDown className='w-4 h-4 ml-2 opacity-50' />
      </Button>

      {isOpen && (
        <>
          <div
            className='fixed inset-0 z-10'
            onClick={() => setIsOpen(false)}
          />
          <div className='absolute top-full left-0 mt-1 w-64 bg-white border rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto'>
            <div className='p-2'>
              <p className='text-xs font-medium text-slate-500 px-2 py-1'>
                Popular
              </p>
              {popularCurrencies.map((code) => {
                const currency = SUPPORTED_CURRENCIES[code]
                return (
                  <button
                    key={code}
                    onClick={() => {
                      onChange(code)
                      setIsOpen(false)
                    }}
                    className={`w-full flex items-center justify-between px-2 py-2 rounded hover:bg-slate-100 ${
                      value === code ? 'bg-slate-50' : ''
                    }`}>
                    <span className='flex items-center gap-2'>
                      <span className='text-lg w-6 text-center'>
                        {currency.symbol}
                      </span>
                      <span className='font-medium'>{code}</span>
                      <span className='text-sm text-slate-500'>
                        {currency.name}
                      </span>
                    </span>
                    {value === code && (
                      <Check className='w-4 h-4 text-blue-600' />
                    )}
                  </button>
                )
              })}

              <p className='text-xs font-medium text-slate-500 px-2 py-1 mt-2 border-t pt-2'>
                All Currencies
              </p>
              {otherCurrencies.map((code) => {
                const currency = SUPPORTED_CURRENCIES[code]
                return (
                  <button
                    key={code}
                    onClick={() => {
                      onChange(code)
                      setIsOpen(false)
                    }}
                    className={`w-full flex items-center justify-between px-2 py-2 rounded hover:bg-slate-100 ${
                      value === code ? 'bg-slate-50' : ''
                    }`}>
                    <span className='flex items-center gap-2'>
                      <span className='text-lg w-6 text-center'>
                        {currency.symbol}
                      </span>
                      <span className='font-medium'>{code}</span>
                      <span className='text-sm text-slate-500'>
                        {currency.name}
                      </span>
                    </span>
                    {value === code && (
                      <Check className='w-4 h-4 text-blue-600' />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
