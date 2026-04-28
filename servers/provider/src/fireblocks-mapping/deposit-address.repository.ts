import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class DepositAddressRepository {
  constructor(private readonly prisma: PrismaService) {}

  upsertByUserAndAsset(input: {
    userId: string;
    vaultAccountId: string;
    fireblocksAssetLegacyId: string;
    blockchainKey?: string;
    address: string;
    tag?: string;
    legacyAddress?: string;
    walletStatus?: string;
    activationTxId?: string;
    addressRowId?: string;
    isPrimary?: boolean;
  }) {
    return this.prisma.fireblocksDepositAddress.upsert({
      where: {
        userId_fireblocksAssetLegacyId: {
          userId: input.userId,
          fireblocksAssetLegacyId: input.fireblocksAssetLegacyId,
        },
      },
      create: {
        userId: input.userId,
        vaultAccountId: input.vaultAccountId,
        fireblocksAssetLegacyId: input.fireblocksAssetLegacyId,
        blockchainKey: input.blockchainKey,
        address: input.address,
        tag: input.tag,
        legacyAddress: input.legacyAddress,
        walletStatus: input.walletStatus,
        activationTxId: input.activationTxId,
        addressRowId: input.addressRowId,
        isPrimary: input.isPrimary ?? true,
      },
      update: {
        vaultAccountId: input.vaultAccountId,
        blockchainKey: input.blockchainKey,
        address: input.address,
        tag: input.tag,
        legacyAddress: input.legacyAddress,
        walletStatus: input.walletStatus,
        activationTxId: input.activationTxId,
        addressRowId: input.addressRowId,
        isPrimary: input.isPrimary ?? true,
      },
    });
  }
}
