import { Module } from "@nestjs/common";
import { AuthController } from "./auth/auth.controller";
import { AuthService } from "./auth/auth.service";
import { AssetsController } from "./assets/assets.controller";
import { AssetsRepository } from "./assets/assets.repository";
import { AssetsService } from "./assets/assets.service";
import { PrismaService } from "./database/prisma.service";
import { DepositAssetsController } from "./deposit-assets/deposit-assets.controller";
import { DepositAssetsService } from "./deposit-assets/deposit-assets.service";
import { DepositAddressRepository } from "./fireblocks-mapping/deposit-address.repository";
import { HealthController } from "./health/health.controller";
import { TransactionsController } from "./transactions/transactions.controller";
import { TransactionsRepository } from "./transactions/transactions.repository";
import { TransactionsService } from "./transactions/transactions.service";
import { UsersRepository } from "./users/users.repository";
import { UsersService } from "./users/users.service";
import { VaultsController } from "./vaults/vaults.controller";
import { VaultsRepository } from "./vaults/vaults.repository";
import { VaultsService } from "./vaults/vaults.service";
import { WalletOnboardingService } from "./wallet-onboarding/wallet-onboarding.service";
import { MfaModule } from "./mfa/mfa.module";

@Module({
  imports: [MfaModule],
  controllers: [
    HealthController,
    AssetsController,
    VaultsController,
    TransactionsController,
    DepositAssetsController,
    AuthController,
  ],
  providers: [
    PrismaService,
    AssetsService,
    VaultsService,
    TransactionsService,
    DepositAssetsService,
    AuthService,
    UsersService,
    WalletOnboardingService,
    AssetsRepository,
    VaultsRepository,
    TransactionsRepository,
    UsersRepository,
    DepositAddressRepository,
  ],
})
export class AppModule {}
