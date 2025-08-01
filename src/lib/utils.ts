import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generování 20-znakového hashe pro URL
export const generateHash = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 20; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Generování 4-místného PIN kódu
export const generate4DigitPIN = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

// Generování UUID pro URL přístup
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Generování 9-místného PIN kódu
export const generatePIN = (): string => {
  return Math.floor(100000000 + Math.random() * 900000000).toString()
}

// Validace PIN kódu (9 číslic)
export const isValidPIN = (pin: string): boolean => {
  return /^\d{9}$/.test(pin)
}

// Validace 4-místného PIN kódu
export const isValid4DigitPIN = (pin: string): boolean => {
  return /^\d{4}$/.test(pin)
}

// Formátování ceny
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK'
  }).format(price)
}

// Formátování data
export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('cs-CZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Výpočet ceny na osobu
export const calculatePricePerPerson = (totalPrice: number, peopleCount: number): number => {
  if (peopleCount <= 0) return 0
  return Math.ceil(totalPrice / peopleCount)
}
