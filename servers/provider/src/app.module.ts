import { Module } from "@nestjs/common";
import { AssetsController } from "./assets/assets.controller";
import { AssetsRepository } from "./assets/assets.repository";
import { AssetsService } from "./assets/assets.service";
import { HealthController } from "./health/health.controller";
import { TransactionsController } from "./transactions/transactions.controller";
import { TransactionsRepository } from "./transactions/transactions.repository";
import { TransactionsService } from "./transactions/transactions.service";
import { VaultsController } from "./vaults/vaults.controller";
import { VaultsRepository } from "./vaults/vaults.repository";
import { VaultsService } from "./vaults/vaults.service";

@Module({
  controllers: [HealthController, AssetsController, VaultsController, TransactionsController],
  providers: [
    AssetsService,
    VaultsService,
    TransactionsService,
    AssetsRepository,
    VaultsRepository,
    TransactionsRepository,
  ],
})
export class AppModule {}
