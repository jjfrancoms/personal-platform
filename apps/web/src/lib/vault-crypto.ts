/**
 * CipherVault - Zero-Knowledge Cryptography & Utilities
 * Uses Web Crypto API for native AES-256-GCM + PBKDF2 key derivation.
 */

// Convert ArrayBuffer to Hex / Base64
export function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Generate random cryptographic salt or IV
export function generateRandomBytes(length: number): Uint8Array {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return array;
}

/**
 * Derive AES-256 Key from Master Password via PBKDF2 (100,000 iterations + SHA-256)
 */
export async function deriveKeyFromMasterPassword(
  masterPassword: string,
  saltBuffer: ArrayBuffer
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(masterPassword),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBuffer,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt sensitive payload object with AES-256-GCM
 */
export async function encryptVaultPayload(
  payload: Record<string, any>,
  masterPassword: string
): Promise<{ encryptedData: string; iv: string; salt: string }> {
  const salt = generateRandomBytes(16);
  const iv = generateRandomBytes(12);
  const key = await deriveKeyFromMasterPassword(masterPassword, salt.buffer);

  const enc = new TextEncoder();
  const encodedData = enc.encode(JSON.stringify(payload));

  const cipherBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encodedData
  );

  return {
    encryptedData: bufferToBase64(cipherBuffer),
    iv: bufferToBase64(iv.buffer),
    salt: bufferToBase64(salt.buffer),
  };
}

/**
 * Decrypt payload with AES-256-GCM
 */
export async function decryptVaultPayload<T = Record<string, any>>(
  encryptedDataBase64: string,
  ivBase64: string,
  saltBase64: string,
  masterPassword: string
): Promise<T> {
  const saltBuffer = base64ToBuffer(saltBase64);
  const ivBuffer = base64ToBuffer(ivBase64);
  const cipherBuffer = base64ToBuffer(encryptedDataBase64);

  const key = await deriveKeyFromMasterPassword(masterPassword, saltBuffer);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: new Uint8Array(ivBuffer),
    },
    key,
    cipherBuffer
  );

  const dec = new TextDecoder();
  const jsonString = dec.decode(decryptedBuffer);
  return JSON.parse(jsonString) as T;
}

// ----------------------------------------------------
// Password Generator with Custom Presets
// ----------------------------------------------------

export interface PasswordGeneratorOptions {
  length: number;
  useUppercase?: boolean;
  useLowercase?: boolean;
  useNumbers?: boolean;
  useSymbols?: boolean;
  excludeAmbiguous?: boolean; // exclude l, 1, I, O, 0
  mode?: "random" | "passphrase" | "pin";
  wordCount?: number;
  wordSeparator?: "-" | "_" | "." | " ";
}

const WORDS_LIST = [
  "cyber", "quantum", "shadow", "aurora", "matrix", "shield", "phoenix",
  "nexus", "falcon", "vortex", "titan", "stellar", "nebula", "glacier",
  "zenith", "cobalt", "crimson", "cipher", "hyper", "echo", "pulsar",
  "orbit", "plasma", "forge", "beacon", "crypto", "solace", "horizon"
];

export function generateSmartPassword(options: PasswordGeneratorOptions): string {
  const {
    length = 16,
    useUppercase = true,
    useLowercase = true,
    useNumbers = true,
    useSymbols = true,
    excludeAmbiguous = false,
    mode = "random",
    wordCount = 4,
    wordSeparator = "-",
  } = options;

  if (mode === "pin") {
    const digits = "0123456789";
    const bytes = generateRandomBytes(length);
    let pin = "";
    for (let i = 0; i < length; i++) {
      pin += digits[bytes[i] % digits.length];
    }
    return pin;
  }

  if (mode === "passphrase") {
    const bytes = generateRandomBytes(wordCount * 2);
    const chosenWords: string[] = [];
    for (let i = 0; i < wordCount; i++) {
      const index = (bytes[i * 2] * 256 + bytes[i * 2 + 1]) % WORDS_LIST.length;
      let word = WORDS_LIST[index];
      if (useUppercase && i % 2 === 0) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }
      chosenWords.push(word);
    }
    let result = chosenWords.join(wordSeparator);
    if (useNumbers) {
      result += `${wordSeparator}${(bytes[0] % 900) + 100}`;
    }
    return result;
  }

  let charset = "";
  if (useLowercase) charset += excludeAmbiguous ? "abcdefghjkmnpqrstuvwxyz" : "abcdefghijklmnopqrstuvwxyz";
  if (useUppercase) charset += excludeAmbiguous ? "ABCDEFGHJKLMNPQRSTUVWXYZ" : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (useNumbers) charset += excludeAmbiguous ? "23456789" : "0123456789";
  if (useSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";

  if (!charset) charset = "abcdefghijklmnopqrstuvwxyz";

  const randomBytes = generateRandomBytes(length);
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }

  return password;
}

// ----------------------------------------------------
// Evaluador de Salud de Contraseñas y Entropía
// ----------------------------------------------------

export interface PasswordHealth {
  score: number; // 0 - 100
  rating: "Muy Débil" | "Débil" | "Aceptable" | "Fuerte" | "Grado Militar";
  color: string;
  feedback: string[];
}

export function evaluatePasswordHealth(password: string): PasswordHealth {
  if (!password) {
    return { score: 0, rating: "Muy Débil", color: "#ef4444", feedback: ["La contraseña está vacía"] };
  }

  let score = 0;
  const feedback: string[] = [];

  // Puntuación por longitud
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 20;
  if (password.length >= 16) score += 15;
  if (password.length >= 20) score += 10;
  if (password.length < 8) feedback.push("Demasiado corta (se recomiendan mínimo 8 caracteres)");

  // Puntuación por variedad
  if (/[a-z]/.test(password)) score += 10;
  else feedback.push("Añade letras minúsculas");

  if (/[A-Z]/.test(password)) score += 10;
  else feedback.push("Añade letras mayúsculas");

  if (/[0-9]/.test(password)) score += 10;
  else feedback.push("Añade números");

  if (/[^a-zA-Z0-9]/.test(password)) score += 15;
  else feedback.push("Añade símbolos o caracteres especiales");

  // Penalización por patrones simples
  if (/^[a-zA-Z]+$/.test(password) || /^[0-9]+$/.test(password)) {
    score = Math.max(10, score - 20);
    feedback.push("Evita usar únicamente letras o únicamente números");
  }

  if (/(.)\1{2,}/.test(password)) {
    score = Math.max(10, score - 15);
    feedback.push("Evita caracteres repetidos consecutivamente");
  }

  score = Math.min(100, Math.max(0, score));

  let rating: PasswordHealth["rating"] = "Débil";
  let color = "#ef4444";

  if (score >= 90) {
    rating = "Grado Militar";
    color = "#10b981"; // Esmeralda
  } else if (score >= 70) {
    rating = "Fuerte";
    color = "#06b6d4"; // Cian
  } else if (score >= 45) {
    rating = "Aceptable";
    color = "#f59e0b"; // Ámbar
  } else if (score >= 25) {
    rating = "Débil";
    color = "#f97316"; // Naranja
  } else {
    rating = "Muy Débil";
    color = "#ef4444"; // Rojo
  }

  return { score, rating, color, feedback };
}

// ----------------------------------------------------
// TOTP (Time-based One-Time Password / RFC 6238)
// ----------------------------------------------------

function base32ToBuffer(base32: string): Uint8Array {
  const cleanBase32 = base32.toUpperCase().replace(/[\s-]/g, "");
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";

  for (let i = 0; i < cleanBase32.length; i++) {
    const val = alphabet.indexOf(cleanBase32[i]);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, "0");
  }

  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }

  return new Uint8Array(bytes);
}

export async function generateTOTPCode(
  secretBase32: string,
  period = 30
): Promise<{ code: string; remainingSeconds: number }> {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const timeStep = Math.floor(nowSeconds / period);
  const remainingSeconds = period - (nowSeconds % period);

  if (!secretBase32 || secretBase32.trim().length < 8) {
    return { code: "------", remainingSeconds };
  }

  try {
    const keyBytes = base32ToBuffer(secretBase32);
    if (keyBytes.length === 0) return { code: "------", remainingSeconds };

    const timeBuffer = new ArrayBuffer(8);
    const timeView = new DataView(timeBuffer);
    timeView.setBigUint64(0, BigInt(timeStep), false);

    const cryptoKey = await window.crypto.subtle.importKey(
      "raw",
      keyBytes.buffer as ArrayBuffer,
      { name: "HMAC", hash: { name: "SHA-1" } },
      false,
      ["sign"]
    );

    const signature = await window.crypto.subtle.sign("HMAC", cryptoKey, timeBuffer);
    const signatureBytes = new Uint8Array(signature);

    const offset = signatureBytes[signatureBytes.length - 1] & 0x0f;
    const binary =
      ((signatureBytes[offset] & 0x7f) << 24) |
      ((signatureBytes[offset + 1] & 0xff) << 16) |
      ((signatureBytes[offset + 2] & 0xff) << 8) |
      (signatureBytes[offset + 3] & 0xff);

    const otp = binary % 1000000;
    const code = otp.toString().padStart(6, "0");

    return { code, remainingSeconds };
  } catch {
    return { code: "------", remainingSeconds };
  }
}
