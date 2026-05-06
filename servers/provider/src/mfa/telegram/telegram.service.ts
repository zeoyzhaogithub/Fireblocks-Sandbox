import { Injectable } from "@nestjs/common";

@Injectable()
export class TelegramOtpService {
  send(_email: string) {
    // TODO: resolve user / chat_id, send OTP via Bot API
    return { ok: false as const, message: "not implemented" };
  }
}
