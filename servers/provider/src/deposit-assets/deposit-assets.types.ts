export const DEPOSIT_BLOCKCHAIN_KEYS = [
  "TRON",
  "TON",
  "ETH",
  "POLYGON",
  "BSC",
  "SOL",
  "AVAX",
  "ARBITRUM",
  "OPTIMISM",
  "BASE",
  "STELLAR",
  "ALGO",
  "OTHER",
] as const;

export type DepositBlockchainKey = (typeof DEPOSIT_BLOCKCHAIN_KEYS)[number];

export type DepositAssetEntry = {
  /** Fireblocks Vault API 路径使用的 legacy asset id（见 List assets 的 legacyId） */
  fireblocksAssetLegacyId: string;
  /** 可选：Fireblocks 返回的 blockchainId（UUID） */
  fireblocksBlockchainId?: string;
  /** 业务展示 / 报表用链标识（受枚举限制） */
  blockchainKey: DepositBlockchainKey;
  /** 可选：前端或运营展示名 */
  label?: string;
  /** 为 false 时编排开通钱包时会跳过该项 */
  enabled: boolean;
  /** 升序；相同 sortOrder 时保持 JSON 中的相对顺序 */
  sortOrder: number;
};

export type DepositAssetsConfigFile = {
  assets: DepositAssetEntry[];
};
