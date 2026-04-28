import { Injectable, Logger } from "@nestjs/common";
import { getFireblocksClient } from "@service/fireblocks";
import { DepositAssetsService } from "../deposit-assets/deposit-assets.service";
import { DepositAddressRepository } from "../fireblocks-mapping/deposit-address.repository";
import { VaultMappingRepository } from "../fireblocks-mapping/vault-mapping.repository";

type FireblocksAddress = {
  address?: string;
  tag?: string;
  legacyAddress?: string;
  id?: string;
};

@Injectable()
export class WalletOnboardingService {
  private readonly logger = new Logger(WalletOnboardingService.name);

  constructor(
    private readonly vaultMappingRepository: VaultMappingRepository,
    private readonly depositAddressRepository: DepositAddressRepository,
    private readonly depositAssetsService: DepositAssetsService,
  ) {}

  async ensureUserWallets(input: { userId: string; email: string }) {
    const fireblocks = getFireblocksClient();
    const existingVault = await this.vaultMappingRepository.findByUserId(input.userId);
    let vaultAccountId = existingVault?.vaultAccountId;
    let createdVault = false;

    if (!vaultAccountId) {
      const vaultName = `user_${input.userId}`.slice(0, 60);
      const created = await fireblocks.vaults.createVaultAccount({
        createVaultAccountRequest: {
          name: vaultName,
          customerRefId: input.userId,
          hiddenOnUI: true,
          autoFuel: false,
        },
      });
      const createdVaultId = String((created.data as { id?: string | number }).id ?? "");
      if (!createdVaultId) {
        throw new Error("Fireblocks createVaultAccount returned empty id");
      }
      vaultAccountId = createdVaultId;
      createdVault = true;
      await this.vaultMappingRepository.upsertByUserId({
        userId: input.userId,
        vaultAccountId,
        vaultName,
        customerRefId: input.userId,
        hiddenOnUi: true,
        autoFuel: false,
      });
    }

    const assets = this.depositAssetsService.getEnabledEntries();
    const syncedAddresses: Array<{ assetLegacyId: string; blockchainKey: string; address: string; tag?: string }> = [];

    for (const asset of assets) {
      try {
        await fireblocks.vaults.createVaultAccountAsset({
          vaultAccountId,
          assetId: asset.fireblocksAssetLegacyId,
        });
      }
      catch (error) {
        this.logger.warn(
          `createVaultAccountAsset skipped for ${asset.fireblocksAssetLegacyId}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }

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

      await this.depositAddressRepository.upsertByUserAndAsset({
        userId: input.userId,
        vaultAccountId,
        fireblocksAssetLegacyId: asset.fireblocksAssetLegacyId,
        blockchainKey: asset.blockchainKey,
        address: primaryAddress.address,
        tag: primaryAddress.tag,
        legacyAddress: primaryAddress.legacyAddress,
        addressRowId: primaryAddress.id,
        isPrimary: true,
      });
      syncedAddresses.push({
        assetLegacyId: asset.fireblocksAssetLegacyId,
        blockchainKey: asset.blockchainKey,
        address: primaryAddress.address,
        tag: primaryAddress.tag,
      });
    }

    return {
      vaultAccountId,
      createdVault,
      syncedAddresses,
      email: input.email,
    };
  }
}
