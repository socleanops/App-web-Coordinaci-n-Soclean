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

export function generateComplexPassword(length: number = 12): string {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const special = "!@#$%^&*";

  const allChars = lowercase + uppercase + numbers + special;

  let password = "";

  // Ensure at least one character from each set
  password += lowercase[window.crypto.getRandomValues(new Uint32Array(1))[0] % lowercase.length];
  password += uppercase[window.crypto.getRandomValues(new Uint32Array(1))[0] % uppercase.length];
  password += numbers[window.crypto.getRandomValues(new Uint32Array(1))[0] % numbers.length];
  password += special[window.crypto.getRandomValues(new Uint32Array(1))[0] % special.length];

  for (let i = 4; i < length; i++) {
    password += allChars[window.crypto.getRandomValues(new Uint32Array(1))[0] % allChars.length];
  }

  // Shuffle the password
  const passwordArray = password.split('');
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = window.crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }

  return passwordArray.join('');
}
