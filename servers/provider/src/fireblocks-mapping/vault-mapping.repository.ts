import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class VaultMappingRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUserId(userId: string) {
    return this.prisma.userFireblocksVault.findUnique({
      where: { userId },
    });
  }

  upsertByUserId(input: {
    userId: string;
    vaultAccountId: string;
    vaultName?: string;
    customerRefId?: string;
    hiddenOnUi?: boolean;
    autoFuel?: boolean;
  }) {
    return this.prisma.userFireblocksVault.upsert({
      where: { userId: input.userId },
      create: {
        userId: input.userId,
        vaultAccountId: input.vaultAccountId,
        vaultName: input.vaultName,
        customerRefId: input.customerRefId,
        hiddenOnUi: input.hiddenOnUi ?? true,
        autoFuel: input.autoFuel ?? false,
      },
      update: {
        vaultAccountId: input.vaultAccountId,
        vaultName: input.vaultName,
        customerRefId: input.customerRefId,
        hiddenOnUi: input.hiddenOnUi ?? true,
        autoFuel: input.autoFuel ?? false,
      },
    });
  }
}
