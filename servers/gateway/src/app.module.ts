import { Module } from "@nestjs/common";
import { AuthModule } from "./bff/auth/auth.module";
import { AssetsModule } from "./bff/assets/assets.module";
import { DepositAssetsModule } from "./bff/deposit-assets/deposit-assets.module";
import { TransactionsModule } from "./bff/transactions/transactions.module";
import { VaultsModule } from "./bff/vaults/vaults.module";
import { HealthController } from "./health/health.controller";
import { ProviderClientModule } from "./provider-client/provider.module";

@Module({
  imports: [
    ProviderClientModule,
    AuthModule,
    AssetsModule,
    VaultsModule,
    TransactionsModule,
    DepositAssetsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
