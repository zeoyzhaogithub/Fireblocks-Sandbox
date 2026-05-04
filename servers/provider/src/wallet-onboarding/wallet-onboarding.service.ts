import { Inject, Injectable, Logger } from "@nestjs/common";
import { getFireblocksClient } from "@service/fireblocks";
import { DepositAssetsService } from "../deposit-assets/deposit-assets.service";
import { DepositAddressRepository } from "../fireblocks-mapping/deposit-address.repository";
import { UsersRepository } from "../users/users.repository";

type FireblocksAddress = {
  address?: string;
  tag?: string;
  legacyAddress?: string;
  id?: string;
};

function formatError(error: unknown): string {
  if (error instanceof Error) {
    const maybeResponse = error as Error & {
      response?: { status?: number; data?: unknown };
      status?: number;
      data?: unknown;
    };
    const status = maybeResponse.response?.status ?? maybeResponse.status;
    const data = maybeResponse.response?.data ?? maybeResponse.data;
    if (status !== undefined || data !== undefined) {
      return `status=${status ?? "unknown"}, data=${JSON.stringify(data)}`;
    }
    return error.message;
  }
  return String(error);
}

@Injectable()
export class WalletOnboardingService {
  private readonly logger = new Logger(WalletOnboardingService.name);

  constructor(
    // persist per-asset deposit addresses into vault_assets (领导版 schema)
    @Inject(DepositAddressRepository) private readonly depositAddressRepository: DepositAddressRepository,
    // get enabled deposit assets from the deposit_assets table
    @Inject(DepositAssetsService) private readonly depositAssetsService: DepositAssetsService,
    @Inject(UsersRepository) private readonly usersRepository: UsersRepository,
  ) {}

  /**
   * Ensure user wallets and persist address data in vault_assets
   * @param input - The input object containing the user id and email
   * @returns The wallet object
   */
  async ensureUserWallets(input: { userId: string; email: string }) {
    const fireblocks = getFireblocksClient();
    // vault_account_id now belongs to user record.
    const user = await this.usersRepository.findById(input.userId);
    if (!user) {
      throw new Error(`User not found: ${input.userId}`);
    }
    const existingVaultAccountId = user.vault_account_id;
    // 金库账户 ID
    let vaultAccountId = existingVaultAccountId;
    let createdVault = false;

    if (!vaultAccountId) {
      // 创建金库账户

      // 金库账户名称
      const vaultName = `user_${input.userId}`.slice(0, 60);
      // 创建金库账户
      const created = await fireblocks.vaults.createVaultAccount({
        createVaultAccountRequest: {
          name: vaultName,
          customerRefId: input.userId,
          // hiddenOnUI: true,
          hiddenOnUI: false,
          autoFuel: false,
          // vaultType: "MPC", // 类型金库账户
        },
      });
      console.log("wallet-onboarding --- created", created);
      const createdVaultId = String((created.data as { id?: string | number }).id ?? "");
      if (!createdVaultId) {
        throw new Error("Fireblocks createVaultAccount returned empty id");
      }
      vaultAccountId = createdVaultId;
      createdVault = true;
      await this.usersRepository.updateVaultAccountId(input.userId, vaultAccountId);
    }

    // 从 deposit_assets配置文件中获取 enabled 的 deposit assets
    const assets = this.depositAssetsService.getEnabledEntries();
    console.log("wallet-onboarding --- assets", assets);
    // 同步 deposit assets 的地址
    const syncedAddresses: Array<{ assetLegacyId: string; blockchainKey: string; address: string; tag?: string }> = [];

    for (const asset of assets) {
      try {
        // 创建金库账户资产
        try {
          await fireblocks.vaults.createVaultAccountAsset({
            vaultAccountId,
            assetId: asset.fireblocksAssetLegacyId,
          });
        }
        catch (error) {
          this.logger.warn(
            `createVaultAccountAsset skipped for ${asset.fireblocksAssetLegacyId}: ${formatError(error)}`,
          );
        }

        // 获取金库账户资产地址
        const addressesResponse = await fireblocks.vaults.getVaultAccountAssetAddressesPaginated({
          vaultAccountId,
          assetId: asset.fireblocksAssetLegacyId,
          limit: 100,
        });
        const addresses = ((addressesResponse.data as { addresses?: FireblocksAddress[] }).addresses ?? []);
        const primaryAddress = addresses.find((item) => item.address?.trim()) ?? addresses[0];
        if (!primaryAddress?.address) {
          this.logger.warn(`No address found for asset ${asset.fireblocksAssetLegacyId} on vault ${vaultAccountId}`);
          continue;
        }

        // 创建或更新 vault_assets 行（user + network + asset_id）
        await this.depositAddressRepository.upsertByUserAndAsset({
          userId: input.userId,
          assetId: asset.fireblocksAssetLegacyId,
          networkKey: asset.blockchainKey,
          address: primaryAddress.address,
        });
        syncedAddresses.push({
          assetLegacyId: asset.fireblocksAssetLegacyId,
          blockchainKey: asset.blockchainKey,
          address: primaryAddress.address,
          tag: primaryAddress.tag,
        });
      }
      catch (error) {
        this.logger.warn(
          `wallet asset onboarding skipped for ${asset.fireblocksAssetLegacyId} on vault ${vaultAccountId}: ${formatError(error)}`,
        );
      }
    }

    return {
      vaultAccountId,
      createdVault,
      syncedAddresses,
      email: input.email,
    };
  }
}
