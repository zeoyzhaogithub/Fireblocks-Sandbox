import "reflect-metadata";
import { RequestMethod } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { AppModule } from "../src/app.module";
import { ProviderClient } from "../src/provider-client/provider.client";

describe("Gateway auth login", () => {
  // Keep mock mode as the safe default.
  // Real provider mode requires BOTH flags to avoid accidental flaky failures from local env files.
  const useRealProvider = process.env.REAL_PROVIDER_E2E === "true"
    && process.env.VITEST_REAL_PROVIDER_E2E === "true";
  const testEmail = process.env.TEST_LOGIN_EMAIL ?? "demo@example1295.com";
  const testTimeoutMs = useRealProvider ? 30000 : 5000;
  const providerClientMock = {
    login: vi.fn(),
  };
  let app: any;
  let baseUrl = "";

  beforeAll(async () => {
    if (!useRealProvider) {
      providerClientMock.login.mockResolvedValue({
        user: { id: "u_1", email: testEmail, loginCount: 1 },
        wallet: {
          vaultAccountId: "123",
          createdVault: true,
          syncedAddresses: [],
          email: testEmail,
        },
        message: "login success",
      });
    }

    const builder = Test.createTestingModule({
      imports: [AppModule],
    });
    if (!useRealProvider) {
      builder.overrideProvider(ProviderClient).useValue(providerClientMock);
    }
    const moduleRef = await builder.compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api/v1", {
      exclude: [{ path: "health", method: RequestMethod.GET }],
    });
    await app.init();
    await app.listen(0);
    const address = app.getHttpServer().address();
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await app.close();
  });

  it("POST /api/v1/auth/login should proxy login request", async () => {
    const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: testEmail }),
    });
    expect(response.status).toBe(201);
    const body = await response.json();
    console.log("---test login----body", JSON.stringify(body));
    expect(body.message).toBe("login success");
    if (!useRealProvider) {
      expect(providerClientMock.login).toHaveBeenCalledWith({ email: testEmail });
    }
  }, testTimeoutMs);
});

// 
// mock 
// pnpm exec vitest run servers/gateway/test/auth-login.test.ts

// REAL_PROVIDER_E2E=true
// VITEST_REAL_PROVIDER_E2E=true
// TEST_LOGIN_EMAIL=demo@example.com 
// pnpm exec vitest run servers/gateway/test/auth-login.test.ts
// pnpm exec dotenv -e .env -- pnpm exec vitest run servers/gateway/test/auth-login.test.ts