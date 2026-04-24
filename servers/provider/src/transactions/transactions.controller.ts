import { Controller, Get, Inject, Param, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import { TransactionsService } from "./transactions.service";

@ApiTags("fireblocks-transactions")
@Controller()
export class TransactionsController {
  constructor(@Inject(TransactionsService) private readonly transactionsService: TransactionsService) {}

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
