import type { BlockchainsAssetsApiListAssetsRequest } from "@fireblocks/ts-sdk";
import { getFireblocksClient } from "../client";

export async function listAssets(params: BlockchainsAssetsApiListAssetsRequest = {}) {
  const response = await getFireblocksClient().blockchainsAssets.listAssets(params);
  return response.data;
}
