import "reflect-metadata";
import { RequestMethod } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { AppModule } from "../src/app.module";
import { ProviderClient } from "../src/provider-client/provider.client";

describe("Gateway transactions transfer", () => {
  const useRealProvider = process.env.REAL_PROVIDER_E2E === "true"
    && process.env.VITEST_REAL_PROVIDER_E2E === "true";
  const testTimeoutMs = useRealProvider ? 30000 : 5000;
  
  //  转出方金库id
  const sourceVaultAccountId = 6;
  // 转入方金库id
  const destinationVaultAccountId = 7;
  // 资产id 
  const assetId = "TON_TEST";
  // 转账金额
  const amount = "0.01";
  // 外部交易id
  const externalTxId = `transfer-e2e-${Date.now()}`;
  // 备注
  const note = "gateway transfer e2e";
  // 提供者客户端mock
  const providerClientMock = {
    createTransfer: vi.fn(),
  };

  let app: any;
  let baseUrl = "";

  // 在所有测试之前执行
  beforeAll(async () => {
    if (!useRealProvider) {
      // 模拟提供者客户端的createTransfer方法返回值
      providerClientMock.createTransfer.mockResolvedValue({
        id: "mock-tx-1",
        externalTxId,
        assetId,
        amount,
        status: "SUBMITTED",
      });
    }

    // 创建测试模块
    const builder = Test.createTestingModule({
      imports: [AppModule],
    });
    if (!useRealProvider) {
      builder.overrideProvider(ProviderClient).useValue(providerClientMock);
    }
    const moduleRef = await builder.compile();

    // 创建Nest应用
    app = moduleRef.createNestApplication();
    // 设置全局前缀
    app.setGlobalPrefix("api/v1", {
      exclude: [{ path: "health", method: RequestMethod.GET }],
    });
    // 初始化应用
    await app.init();
    await app.listen(0);
    const address = app.getHttpServer().address();
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  // 在所有测试之后执行
  afterAll(async () => {
    await app.close();
  });

  // 测试转账请求
  it("POST /api/v1/transactions/transfer should proxy transfer request", async () => {
    // 构造请求体
    const payload = {
      sourceVaultAccountId,
      destinationVaultAccountId,
      assetId,
      amount,
      externalTxId,
      note,
    };
    // 发送请求
    const response = await fetch(`${baseUrl}/api/v1/transactions/transfer`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    // 验证响应状态码
    expect(response.status).toBe(201);
    // 验证响应体
    const body = await response.json();
    expect(body).toBeTruthy();
    // 如果使用模拟提供者，验证提供者客户端的createTransfer方法是否被调用
    if (!useRealProvider) {
      // 验证提供者客户端的createTransfer方法是否被调用
      expect(providerClientMock.createTransfer).toHaveBeenCalledWith(payload);
      // 验证响应体中的id是否为mock-tx-1
      expect(body.id).toBe("mock-tx-1");
    }
  }, testTimeoutMs);
});

// pnpm exec dotenv -e .env -- pnpm exec vitest run servers/gateway/test/transactions-transfer.test.ts