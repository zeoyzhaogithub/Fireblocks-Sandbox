import { Inject, Injectable } from "@nestjs/common";
import { listPagedVaultAccounts } from "@service/fireblocks";
import { VaultsRepository } from "./vaults.repository";

@Injectable()
export class VaultsService {
  constructor(@Inject(VaultsRepository) private readonly vaultsRepository: VaultsRepository) {}

  async listVaults(limit?: string, after?: string, before?: string, assetId?: string) {
    const parsedLimit = Number(limit);
    const safeLimit = Number.isFinite(parsedLimit)
      ? Math.min(Math.max(Math.trunc(parsedLimit), 1), 500)
      : 100;

    const data = await listPagedVaultAccounts({
      limit: safeLimit,
      after: after?.trim() || undefined,
      before: before?.trim() || undefined,
      assetId: assetId?.trim() || undefined,
    });

    await this.vaultsRepository.saveListSnapshot({
      limit: safeLimit,
      count: data.accounts?.length ?? 0,
      fetchedAt: Date.now(),
    });

    return data;
  }
}
