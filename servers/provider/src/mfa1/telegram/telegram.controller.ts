import { Body, Controller, Inject, Post } from "@nestjs/common";
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { TelegramOtpService } from "./telegram.service";

@ApiTags("telegram-otp")
@Controller("telegram-otp")
export class TelegramOtpController {
    constructor(@Inject(TelegramOtpService) private readonly telegramOtpService: TelegramOtpService) {}

    @Post("send")
    send(@Body() body: { email: string }) {
        return this.telegramOtpService.send(body.email);
    }
}