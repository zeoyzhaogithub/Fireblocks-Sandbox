import { Module } from "@nestjs/common";
import { AssetsController } from "./assets/assets.controller";
import { AssetsRepository } from "./assets/assets.repository";
import { AssetsService } from "./assets/assets.service";
import { DepositAssetsController } from "./deposit-assets/deposit-assets.controller";
import { DepositAssetsService } from "./deposit-assets/deposit-assets.service";
import { HealthController } from "./health/health.controller";
import { TransactionsController } from "./transactions/transactions.controller";
import { TransactionsRepository } from "./transactions/transactions.repository";
import { TransactionsService } from "./transactions/transactions.service";
import { VaultsController } from "./vaults/vaults.controller";
import { VaultsRepository } from "./vaults/vaults.repository";
import { VaultsService } from "./vaults/vaults.service";

@Module({
  controllers: [
    HealthController,
    AssetsController,
    VaultsController,
    TransactionsController,
    DepositAssetsController,
  ],
  providers: [
    AssetsService,
    VaultsService,
    TransactionsService,
    DepositAssetsService,
    AssetsRepository,
    VaultsRepository,
    TransactionsRepository,
  ],
})
export class AppModule {}
