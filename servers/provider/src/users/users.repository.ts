import { Injectable } from "@nestjs/common";
import { AuthProvider } from "@service/database/client";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsertUserByEmail(email: string) {
    return this.prisma.user.upsert({
      where: { email },
      create: {
        email,
        emailVerifiedAt: new Date(),
        status: "ACTIVE",
        loginCount: 1,
        lastLoginAt: new Date(),
      },
      update: {
        emailVerifiedAt: new Date(),
        status: "ACTIVE",
        lastLoginAt: new Date(),
        loginCount: { increment: 1 },
      },
      select: {
        id: true,
        email: true,
        emailVerifiedAt: true,
        createdAt: true,
        lastLoginAt: true,
        loginCount: true,
      },
    });
  }

  async upsertEmailAuthProvider(userId: string, normalizedEmail: string) {
    const existing = await this.prisma.userAuthProvider.findFirst({
      where: {
        provider: AuthProvider.EMAIL,
        providerSubject: normalizedEmail,
      },
      select: { id: true },
    });
    if (existing) {
      return this.prisma.userAuthProvider.update({
        where: { id: existing.id },
        data: { userId },
      });
    }
    return this.prisma.userAuthProvider.create({
      data: {
        userId,
        provider: AuthProvider.EMAIL,
        providerSubject: normalizedEmail,
        linkedAccounts: [{ type: "email", address: normalizedEmail }],
      },
    });
  }
}
