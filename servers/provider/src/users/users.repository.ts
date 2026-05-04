import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class UsersRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async upsertUserByEmail(email: string) {
    // Username is required in current schema; use unique email as stable username.
    const username = email;
    // Password is required in current schema; use a non-loginable placeholder for email-only login flow.
    const placeholderPassword = "__EMAIL_LOGIN_ONLY__";
    return this.prisma.user.upsert({
      where: { email },
      create: {
        email,
        username,
        password: placeholderPassword,
        status: "ACTIVE",
        // Fireblocks vault is assigned in wallet onboarding; empty means “not provisioned yet”.
        vault_account_id: "",
      },
      update: {
        status: "ACTIVE",
      },
      select: {
        id: true,
        email: true,
        created_at: true,
        status: true,
        vault_account_id: true,
      },
    });
  }

  async updateVaultAccountId(userId: string, vaultAccountId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { vault_account_id: vaultAccountId },
      select: { id: true, vault_account_id: true },
    });
  }

  async findById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, vault_account_id: true },
    });
  }
}
