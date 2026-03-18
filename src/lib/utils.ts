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
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";

  // Ensure at least one character of each required type securely
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const specials = "!@#$%^&*()_+~`|}{[]:;?><,./-=";

  const getRandomChar = (str: string) => {
      const arr = new Uint32Array(1);
      window.crypto.getRandomValues(arr);
      return str[arr[0] % str.length];
  };

  let passwordArr = [
      getRandomChar(uppercase),
      getRandomChar(lowercase),
      getRandomChar(numbers),
      getRandomChar(specials)
  ];

  const array = new Uint32Array(length - 4);
  window.crypto.getRandomValues(array);

  for (let i = 0; i < length - 4; i++) {
    passwordArr.push(charset[array[i] % charset.length]);
  }

  // Fisher-Yates shuffle with window.crypto.getRandomValues
  for (let i = passwordArr.length - 1; i > 0; i--) {
      const arr = new Uint32Array(1);
      window.crypto.getRandomValues(arr);
      const j = arr[0] % (i + 1);
      [passwordArr[i], passwordArr[j]] = [passwordArr[j], passwordArr[i]];
  }

  return passwordArr.join('');
}
