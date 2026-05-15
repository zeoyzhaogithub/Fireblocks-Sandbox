import process from "node:process";
import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { authenticator } from "otplib";
import type { AuthenticatorType } from "@service/database/client";
import { prisma } from "@service/database";
import { redis } from "@service/redis";

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);

  async verify(type: AuthenticatorType, userId: string, code: string): Promise<void> {
    if (process.env.MFA_DISABLED === "true") {
      this.logger.warn(`MFA disabled: skipping code verification for user ${userId}, type ${type}`);
      return;
    }

    const row = await prisma.authenticator.findFirst({
      where: {
        user_id: userId,
        type,
        enabled: true,
        verified: true,
      },
    });

    if (!row)
      throw new UnauthorizedException("Authenticator not available");

    switch (type) {
      case "TOTP": {
        const secret = row.secret;
        if (!secret)
          throw new UnauthorizedException("TOTP not configured");
        const ok = authenticator.verify({ token: code, secret });
        if (!ok)
          throw new UnauthorizedException("Invalid TOTP code");
        return;
      }
      case "EMAIL":
      case "TELEGRAM_OTP": {
        const key = `mfa:otp:${userId}:${type}`;
        const expected = await redis.getex(key);
        if (!expected || expected !== code)
          throw new UnauthorizedException("Invalid or expired OTP");
        await redis.del(key);
        return;
      }
      default:
        throw new UnauthorizedException("Unsupported authenticator type");
    }
  }
}
