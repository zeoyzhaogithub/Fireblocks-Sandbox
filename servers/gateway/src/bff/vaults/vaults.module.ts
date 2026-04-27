import { Module } from "@nestjs/common";
import { ProviderClientModule } from "../../provider-client/provider.module";
import { VaultsController } from "./vaults.controller";
import { VaultsService } from "./vaults.service";

@Module({
  imports: [ProviderClientModule],
  controllers: [VaultsController],
  providers: [VaultsService],
})
export class VaultsModule {}
