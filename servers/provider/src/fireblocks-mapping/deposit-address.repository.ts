import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class DepositAddressRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  /**
   * 在 vault_assets 表中按 user + asset + network 创建或更新存款地址（领导版 schema 无复合唯一键，用 findFirst + write）。
   */
  async upsertByUserAndAsset(input: {
    userId: string;
    assetId: string;
    networkKey: string;
    address: string;
  }) {
    const existing = await this.prisma.vaultAsset.findFirst({
      where: {
        user_id: input.userId,
        asset_id: input.assetId,
        network: input.networkKey,
      },
      select: { id: true },
    });
    if (existing) {
      return this.prisma.vaultAsset.update({
        where: { id: existing.id },
        data: { address: input.address },
      });
    }
    return this.prisma.vaultAsset.create({
      data: {
        user_id: input.userId,
        asset_id: input.assetId,
        network: input.networkKey,
        address: input.address,
      },
    });
  }
}
