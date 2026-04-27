import { Module } from "@nestjs/common";
import { ProviderClientModule } from "../../provider-client/provider.module";
import { DepositAssetsController } from "./deposit-assets.controller";
import { DepositAssetsService } from "./deposit-assets.service";

@Module({
  imports: [ProviderClientModule],
  controllers: [DepositAssetsController],
  providers: [DepositAssetsService],
})
export class DepositAssetsModule {}
