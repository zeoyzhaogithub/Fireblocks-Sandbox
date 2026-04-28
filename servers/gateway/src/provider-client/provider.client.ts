import { Injectable } from "@nestjs/common";
import type { LoginResponseDto } from "../bff/auth/dto/login.response.dto";

type QueryValue = string | number | boolean | undefined;
type QueryParams = Record<string, QueryValue>;
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
type JsonBody = Record<string, JsonValue>;

@Injectable()
export class ProviderClient {
  private readonly baseUrl = (process.env.PROVIDER_BASE_URL ?? "http://localhost:4100").replace(/\/$/, "");

  private buildUrl(path: string, query?: QueryParams): string {
    const url = new URL(`${this.baseUrl}${path}`);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }

  private async get<T>(path: string, query?: QueryParams): Promise<T> {
    const response = await fetch(this.buildUrl(path, query));
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Provider request failed: ${response.status} ${response.statusText} - ${body}`);
    }
    return (await response.json()) as T;
  }

  private async post<T>(path: string, body: JsonBody): Promise<T> {
    const response = await fetch(this.buildUrl(path), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Provider request failed: ${response.status} ${response.statusText} - ${text}`);
    }
    return (await response.json()) as T;
  }

  getAssets() {
    return this.get<unknown>("/assets");
  }

  getVaults() {
    return this.get<unknown>("/vaults");
  }

  getTransactions(query: { before?: string; after?: string; limit?: number }) {
    return this.get<unknown>("/transactions", query);
  }

  getTransactionById(txId: string) {
    return this.get<unknown>(`/transactions/${encodeURIComponent(txId)}`);
  }

  getDepositAssetsConfig() {
    return this.get<unknown>("/config/deposit-assets");
  }

  login(input: { email: string }) {
    return this.post<LoginResponseDto>("/auth/login", input);
  }
}
