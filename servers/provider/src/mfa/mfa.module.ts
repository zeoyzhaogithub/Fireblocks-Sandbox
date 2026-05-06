import { Module } from "@nestjs/common";
import { TelegramOtpController } from "./telegram/telegram.controller";
import { TelegramOtpService } from "./telegram/telegram.service";
import { TotpController } from "./totp/totp.controller";
import { TotpService } from "./totp/totp.service";

@Module({
  controllers: [TotpController, TelegramOtpController],
  providers: [TotpService, TelegramOtpService],
})

export class MfaModule {}
