import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { TransactionsService } from "./transactions.service";

@Controller("transactions")
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post("transfer")
  createTransfer(
    @Body()
    body: {
      sourceVaultAccountId: string;
      destinationVaultAccountId: string;
      assetId: string;
      amount: string;
      externalTxId?: string;
      note?: string;
    },
  ) {
    return this.transactionsService.createTransfer(body);
  }

  @Get()
  list(
    @Query("before") before?: string,
    @Query("after") after?: string,
    @Query("limit") limit?: string,
  ) {
    const parsedLimit = limit === undefined ? undefined : Number(limit);
    return this.transactionsService.list({
      before,
      after,
      limit: Number.isNaN(parsedLimit) ? undefined : parsedLimit,
    });
  }

  @Get(":txId")
  getById(@Param("txId") txId: string) {
    return this.transactionsService.getById(txId);
  }
}
