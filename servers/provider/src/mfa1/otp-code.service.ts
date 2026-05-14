import { Injectable } from "@nestjs/common";
import { randomInt } from "node:crypto";

/**
 * 6 位数字 OTP（000000–999999），供 Telegram / 邮箱等渠道共用。
 * 使用 crypto.randomInt，避免 Math.random 的可预测性与取模偏差。
 */
@Injectable()
export class OtpCodeService {
    generate(): string {
        return String(randomInt(0, 1_000_000)).padStart(6, "0");
    }
}
