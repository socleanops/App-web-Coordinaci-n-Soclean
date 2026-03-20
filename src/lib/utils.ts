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
    const charsetLowercase = "abcdefghijklmnopqrstuvwxyz";
    const charsetUppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const charsetNumbers = "0123456789";
    const charsetSpecial = "!@#$%^&*()_+~`|}{[]:;?><,./-=";

    const allCharsets = charsetLowercase + charsetUppercase + charsetNumbers + charsetSpecial;

    let password = "";

    // Ensure at least one character from each set
    const randomVals = new Uint32Array(length);
    window.crypto.getRandomValues(randomVals);

    password += charsetLowercase[randomVals[0] % charsetLowercase.length];
    password += charsetUppercase[randomVals[1] % charsetUppercase.length];
    password += charsetNumbers[randomVals[2] % charsetNumbers.length];
    password += charsetSpecial[randomVals[3] % charsetSpecial.length];

    // Fill the rest with random characters from all sets
    for (let i = 4; i < length; i++) {
        password += allCharsets[randomVals[i] % allCharsets.length];
    }

    // Shuffle the characters
    const passwordArray = password.split('');
    const shuffleVals = new Uint32Array(length);
    window.crypto.getRandomValues(shuffleVals);

    for (let i = length - 1; i > 0; i--) {
        const j = shuffleVals[i] % (i + 1);
        const temp = passwordArray[i];
        passwordArray[i] = passwordArray[j];
        passwordArray[j] = temp;
    }

    return passwordArray.join('');
}
