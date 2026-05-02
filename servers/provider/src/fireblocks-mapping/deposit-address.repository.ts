import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class DepositAddressRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  /**
   *  在 custody_wallet_deposit_addresses 表 中 创建或更新 存款地址数据
   * @param input - The input object containing user id, asset id, network key and address
   * @returns The deposit address object
   */
  upsertByUserAndAsset(input: {
    userId: string;
    assetId: string;
    networkKey: string;
    address: string;
  }) {
    return this.prisma.custodyWalletDepositAddress.upsert({
      where: {
        user_id_network_key_asset_id: {
          user_id: input.userId,
          network_key: input.networkKey,
          asset_id: input.assetId,
        },
      },
      create: {
        user_id: input.userId,
        asset_id: input.assetId,
        network_key: input.networkKey,
        address: input.address,
      },
      update: {
        network_key: input.networkKey,
        address: input.address,
      },
    });
  }
}
