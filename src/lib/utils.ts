import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSecureRandomString(length: number = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint32Array(length);
  window.crypto.getRandomValues(array);

  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}

export function generateSecurePassword(length: number = 12): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

  const allChars = lowercase + uppercase + numbers + symbols;
  const array = new Uint32Array(length);
  window.crypto.getRandomValues(array);

  let password = '';
  // Ensure at least one of each required type
  password += lowercase[new Uint32Array(window.crypto.getRandomValues(new Uint32Array(1)))[0] % lowercase.length];
  password += uppercase[new Uint32Array(window.crypto.getRandomValues(new Uint32Array(1)))[0] % uppercase.length];
  password += numbers[new Uint32Array(window.crypto.getRandomValues(new Uint32Array(1)))[0] % numbers.length];
  password += symbols[new Uint32Array(window.crypto.getRandomValues(new Uint32Array(1)))[0] % symbols.length];

  // Fill the rest
  for (let i = 4; i < length; i++) {
    password += allChars[array[i] % allChars.length];
  }

  // Shuffle the password
  const passwordArray = password.split('');
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = new Uint32Array(window.crypto.getRandomValues(new Uint32Array(1)))[0] % (i + 1);
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }

  return passwordArray.join('');
}
