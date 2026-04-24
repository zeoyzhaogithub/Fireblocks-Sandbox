import fs from "node:fs";
import process from "node:process";
import { Fireblocks } from "@fireblocks/ts-sdk";

const FIREBLOCKS_UNAVAILABLE_MESSAGE =
  "Fireblocks is not available, please configure FIREBLOCKS_API_KEY, FIREBLOCKS_BASE_PATH (or FIREBLOCKS_BASE_URL), and FIREBLOCKS_SECRET_KEY (or FIREBLOCKS_PRIVATE_KEY_PATH).";

function normalizeBasePath(rawValue: string | undefined): string | undefined {
  const value = rawValue?.trim();
  if (!value) {
    return undefined;
  }
  return value.endsWith("/v1") ? value : `${value}/v1`;
}

function resolveSecretKey(): string | undefined {
  const inlineSecretKey = process.env.FIREBLOCKS_SECRET_KEY?.trim();
  if (inlineSecretKey) {
    return inlineSecretKey;
  }

  const secretKeyPath = process.env.FIREBLOCKS_PRIVATE_KEY_PATH?.trim();
  if (!secretKeyPath) {
    return undefined;
  }

  if (!fs.existsSync(secretKeyPath)) {
    return undefined;
  }

  const secretKey = fs.readFileSync(secretKeyPath, "utf8").trim();
  return secretKey || undefined;
}

function createUnavailableProxy<T>(message: string): T {
  return new Proxy(
    {},
    {
      get() {
        throw new Error(message);
      },
      apply() {
        throw new Error(message);
      },
    },
  ) as T;
}

function createClientIfReady(): Fireblocks | null {
  const apiKey = process.env.FIREBLOCKS_API_KEY?.trim();
  const basePath = normalizeBasePath(process.env.FIREBLOCKS_BASE_PATH ?? process.env.FIREBLOCKS_BASE_URL);
  const secretKey = resolveSecretKey();

  if (!apiKey || !basePath || !secretKey) {
    return null;
  }

  return new Fireblocks({
    apiKey,
    secretKey,
    basePath,
  });
}

const resolvedFireblocksClient = createClientIfReady();

export const fireblocks: Fireblocks = resolvedFireblocksClient ?? createUnavailableProxy<Fireblocks>(FIREBLOCKS_UNAVAILABLE_MESSAGE);
export const isFireblocksEnabled = resolvedFireblocksClient !== null;

export function getFireblocksClient(): Fireblocks {
  if (!resolvedFireblocksClient) {
    throw new Error(FIREBLOCKS_UNAVAILABLE_MESSAGE);
  }
  return resolvedFireblocksClient;
}
