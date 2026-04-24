import type { VaultsApiGetPagedVaultAccountsRequest } from "@fireblocks/ts-sdk";
import { getFireblocksClient } from "../client";

export async function listPagedVaultAccounts(params: VaultsApiGetPagedVaultAccountsRequest = {}) {
  const response = await getFireblocksClient().vaults.getPagedVaultAccounts(params);
  return response.data;
}
