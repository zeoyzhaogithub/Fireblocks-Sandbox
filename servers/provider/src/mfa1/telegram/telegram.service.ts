import { Injectable } from "@nestjs/common";

@Injectable()
export class TelegramOtpService {
    send(_email: string) {
        // TODO: inject OtpCodeService → generate(); hash+store+expiry; send plain code via Bot API
        return { ok: false as const, message: "not implemented" };
    }
}
