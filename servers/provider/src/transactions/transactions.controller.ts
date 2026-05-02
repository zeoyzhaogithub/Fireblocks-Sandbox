import { Body, Controller, Get, Inject, Param, Post, Query } from "@nestjs/common";
import { ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import { CreateTransferDto } from "./dto/create-transfer.dto";
import { TransactionsService } from "./transactions.service";

@ApiTags("fireblocks-transactions")
@Controller()
export class TransactionsController {
  constructor(@Inject(TransactionsService) private readonly transactionsService: TransactionsService) {}

  /**
   * 创建一笔 Vault -> Vault 模拟转账交易（沙盒验证主流程）。
   */
  @Post("transactions/transfer")
  @ApiOperation({
    summary: "Create a Vault->Vault transfer transaction",
    description:
      "Creates a transfer transaction in Fireblocks from one vault account to another. Suitable for sandbox transfer simulation.",
  })
  @ApiBody({
    schema: {
      type: "object",
      required: ["sourceVaultAccountId", "destinationVaultAccountId", "assetId", "amount"],
      properties: {
        sourceVaultAccountId: {
          type: "string",
          description: "源 vaultAccountId（转出金库）",
          example: "12",
        },
        destinationVaultAccountId: {
          type: "string",
          description: "目标 vaultAccountId（转入金库）",
          example: "34",
        },
        assetId: {
          type: "string",
          description: "资产编码（如 BTC_TEST / ETH_TEST3 / USDT_TRX）",
          example: "ETH_TEST3",
        },
        amount: {
          type: "string",
          description: "转账金额（字符串）",
          example: "0.01",
        },
        externalTxId: {
          type: "string",
          description: "业务幂等标识（建议传唯一值，防止重复提交）",
          example: "transfer-20260429-001",
          nullable: true,
        },
        note: {
          type: "string",
          description: "交易备注",
          example: "sandbox vault to vault transfer",
          nullable: true,
        },
      },
    },
  })
  @ApiOkResponse({
    description: "Transfer transaction created",
    schema: {
      example: {
        id: "f9a936aa-77dc-49f6-9ab5-3f5e455f78f9",
        externalTxId: "transfer-20260429-001",
        assetId: "ETH_TEST3",
        amount: "0.01",
        status: "SUBMITTED",
        subStatus: "PENDING_SIGNATURE",
        createdAt: 1713959200000,
        source: {
          type: "VAULT_ACCOUNT",
          id: "12",
        },
        destination: {
          type: "VAULT_ACCOUNT",
          id: "34",
        },
      },
    },
  })
  async createTransfer(@Body() body: CreateTransferDto) {
    return this.transactionsService.createTransfer(body);
  }

  /**
   * 查询 Fireblocks 交易列表（支持分页/时间窗/状态过滤）。
   */
  @Get("transactions")
  @ApiOperation({
    summary: "List Fireblocks transactions",
    description:
      "Returns transaction history from Fireblocks. Supports cursor/time filters and status filtering.",
  })
  @ApiQuery({ name: "limit", required: false, description: "Result size (1-500)" })
  @ApiQuery({ name: "next", required: false, description: "Next-page cursor" })
  @ApiQuery({ name: "prev", required: false, description: "Previous-page cursor" })
  @ApiQuery({ name: "before", required: false, description: "Only transactions created before this timestamp (ms)" })
  @ApiQuery({ name: "after", required: false, description: "Only transactions created after this timestamp (ms)" })
  @ApiQuery({ name: "status", required: false, description: "Filter by transaction status" })
  @ApiOkResponse({
    description: "Transactions list",
    schema: {
      example: [
        {
          id: "d53f7f2a-1c17-4c7f-b1ae-50eb9a2d7a6b",
          externalId: "order-20260423-001",
          assetId: "BTC_TEST",
          amount: "0.01",
          status: "COMPLETED",
          subStatus: "CONFIRMED",
          createdAt: 1713859200000,
        },
      ],
    },
  })
  async listTransactions(
    @Query("limit") limit?: string,
    @Query("next") next?: string,
    @Query("prev") prev?: string,
    @Query("before") before?: string,
    @Query("after") after?: string,
    @Query("status") status?: string,
  ) {
    return this.transactionsService.listTransactions(limit, next, prev, before, after, status);
  }

  /**
   * 根据 Fireblocks txId 查询单笔交易详情（用于状态追踪/排障）。
   */
  @Get("transactions/:txId")
  @ApiOperation({
    summary: "Get a Fireblocks transaction by txId",
    description:
      "Returns details for a single transaction by Fireblocks transaction ID. Use this for status tracking and troubleshooting.",
  })
  @ApiParam({ name: "txId", description: "Fireblocks transaction ID" })
  @ApiOkResponse({
    description: "Transaction details",
    schema: {
      example: {
        id: "d53f7f2a-1c17-4c7f-b1ae-50eb9a2d7a6b",
        externalId: "order-20260423-001",
        assetId: "BTC_TEST",
        amount: "0.01",
        status: "COMPLETED",
        subStatus: "CONFIRMED",
        createdAt: 1713859200000,
        source: {
          type: "VAULT_ACCOUNT",
          id: "0",
        },
        destination: {
          type: "EXTERNAL_WALLET",
          id: "14",
        },
        txHash: "0x8f17c8b0c8d3b2f3c1b42f7af4b9f1f8db0a5d4f8f21e3f3f1c5b7b4f0acb2d9",
      },
    },
  })
  async getTransaction(@Param("txId") txId: string) {
    return this.transactionsService.getTransaction(txId);
  }
}
