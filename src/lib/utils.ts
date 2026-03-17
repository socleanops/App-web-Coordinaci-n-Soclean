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
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*()_+~`|}{[]:;?><,./-=";
  const allChars = upper + lower + numbers + special;

  const array = new Uint32Array(length);
  window.crypto.getRandomValues(array);

  let password = "";
  // Ensure at least one of each required type is present
  password += upper[array[0] % upper.length];
  password += lower[array[1] % lower.length];
  password += numbers[array[2] % numbers.length];
  password += special[array[3] % special.length];

  for (let i = 4; i < length; i++) {
    password += allChars[array[i] % allChars.length];
  }

  // Shuffle the string to avoid predictable positions for mandatory chars
  const charArray = password.split('');
  const shuffleArray = new Uint32Array(charArray.length);
  window.crypto.getRandomValues(shuffleArray);
  for (let i = charArray.length - 1; i > 0; i--) {
    const j = shuffleArray[i] % (i + 1);
    [charArray[i], charArray[j]] = [charArray[j], charArray[i]];
  }

  return charArray.join('');
}
