import { Module } from "@nestjs/common";
import { ProviderClientModule } from "../../provider-client/provider.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
  imports: [ProviderClientModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
