import type { GadgetId } from "@/lib/game/constants";
import type { LevelId } from "../game/LevelId";

export type GameSaveData = {
  levelId: LevelId;
  gadgetsUnlocked: Record<GadgetId, boolean>;
  capturedCreatures: string[];
  capturedCount: number;
};

export type GameSave = {
  version: number;
  updatedAt: string;
  data: GameSaveData;
};

type EncryptedSave = {
  version: number;
  salt: string;
  iv: string;
  ciphertext: string;
  iterations: number;
};

export const SAVE_VERSION = 1;
const STORAGE_KEY = "primate-protocol:save:v1";
const SECRET_KEY = "primate-protocol:device-secret:v1";
const PBKDF2_ITERATIONS = 150000;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
const asBufferSource = (bytes: Uint8Array): BufferSource =>
  bytes as BufferSource;

const ensureBrowser = () => {
  if (typeof window === "undefined") {
    throw new Error("Save system is only available in the browser.");
  }
};

const bytesToBase64 = (bytes: Uint8Array) => {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

const base64ToBytes = (base64: string) => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
};

const getDeviceSecret = async (): Promise<Uint8Array> => {
  ensureBrowser();
  const existing = window.localStorage.getItem(SECRET_KEY);
  if (existing) {
    return base64ToBytes(existing);
  }
  const secret = new Uint8Array(32);
  window.crypto.getRandomValues(secret);
  window.localStorage.setItem(SECRET_KEY, bytesToBase64(secret));
  return secret;
};

const deriveKey = async (
  secret: Uint8Array,
  salt: Uint8Array,
  iterations: number
): Promise<CryptoKey> => {
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    asBufferSource(secret),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: asBufferSource(salt),
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

const encryptSave = async (payload: GameSave): Promise<EncryptedSave> => {
  ensureBrowser();
  const secret = await getDeviceSecret();
  const salt = new Uint8Array(16);
  const iv = new Uint8Array(12);
  window.crypto.getRandomValues(salt);
  window.crypto.getRandomValues(iv);

  const key = await deriveKey(secret, salt, PBKDF2_ITERATIONS);
  const encoded = textEncoder.encode(JSON.stringify(payload));
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: asBufferSource(iv) },
    key,
    asBufferSource(encoded)
  );

  return {
    version: SAVE_VERSION,
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
    iterations: PBKDF2_ITERATIONS,
  };
};

const decryptSave = async (payload: EncryptedSave): Promise<GameSave> => {
  ensureBrowser();
  const secret = await getDeviceSecret();
  const salt = base64ToBytes(payload.salt);
  const iv = base64ToBytes(payload.iv);
  const ciphertext = base64ToBytes(payload.ciphertext);
  const key = await deriveKey(secret, salt, payload.iterations);
  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: asBufferSource(iv) },
    key,
    asBufferSource(ciphertext)
  );
  const decoded = textDecoder.decode(decrypted);
  return JSON.parse(decoded) as GameSave;
};

export const isSaveSupported = () =>
  typeof window !== "undefined" &&
  Boolean(window.crypto?.subtle) &&
  Boolean(window.localStorage);

export const saveGame = async (
  data: GameSaveData,
  storageKey: string = STORAGE_KEY
) => {
  ensureBrowser();
  const payload: GameSave = {
    version: SAVE_VERSION,
    updatedAt: new Date().toISOString(),
    data,
  };
  const encrypted = await encryptSave(payload);
  window.localStorage.setItem(storageKey, JSON.stringify(encrypted));
};

export const loadGame = async (
  storageKey: string = STORAGE_KEY
): Promise<GameSaveData | null> => {
  ensureBrowser();
  const stored = window.localStorage.getItem(storageKey);
  if (!stored) {
    return null;
  }
  try {
    const encrypted = JSON.parse(stored) as EncryptedSave;
    const decrypted = await decryptSave(encrypted);
    return migrateSave(decrypted);
  } catch (error) {
    console.warn("Failed to load save data.", error);
    return null;
  }
};

export const clearSave = async (storageKey: string = STORAGE_KEY) => {
  ensureBrowser();
  window.localStorage.removeItem(storageKey);
};

export const migrateSave = (payload: GameSave): GameSaveData | null => {
  if (payload.version > SAVE_VERSION) {
    return null;
  }
  if (payload.version === SAVE_VERSION) {
    return payload.data;
  }
  return payload.data;
};
