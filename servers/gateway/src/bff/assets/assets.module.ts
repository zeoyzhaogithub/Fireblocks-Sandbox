import { Module } from "@nestjs/common";
import { ProviderClientModule } from "../../provider-client/provider.module";
import { AssetsController } from "./assets.controller";
import { AssetsService } from "./assets.service";

@Module({
  imports: [ProviderClientModule],
  controllers: [AssetsController],
  providers: [AssetsService],
})
export class AssetsModule {}
