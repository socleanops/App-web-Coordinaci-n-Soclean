import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSecureRandomString(length: number = 6): string {
  const array = new Uint32Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array, dec => ('0' + dec.toString(36)).slice(-2)).join('').substring(0, length);
}

export function generateComplexPassword(length: number = 10): string {
  const array = new Uint32Array(length);
  window.crypto.getRandomValues(array);
  const randomStr = Array.from(array, dec => ('0' + dec.toString(36)).slice(-2)).join('').substring(0, length - 3);
  // Ensure we meet the complexity requirements: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char.
  return randomStr + 'A1!';
}
