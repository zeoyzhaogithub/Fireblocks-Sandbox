import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { readFileSync } from "node:fs";
import { isAbsolute, join } from "node:path";
import {
  DEPOSIT_BLOCKCHAIN_KEYS,
  type DepositAssetEntry,
  type DepositAssetsConfigFile,
} from "./deposit-assets.types";

function resolveConfigPath(): string {
  const fromEnv = process.env.DEPOSIT_ASSETS_CONFIG_PATH?.trim();
  if (fromEnv) {
    return isAbsolute(fromEnv) ? fromEnv : join(process.cwd(), fromEnv);
  }
  return join(process.cwd(), "config", "deposit-assets.json");
}

function parseAndValidate(raw: string): DepositAssetsConfigFile {
  const parsed: unknown = JSON.parse(raw);
  if (typeof parsed !== "object" || parsed === null || !("assets" in parsed)) {
    throw new Error("deposit-assets config: root must be an object with \"assets\" array");
  }
  const assets = (parsed as { assets: unknown }).assets;
  if (!Array.isArray(assets)) {
    throw new Error("deposit-assets config: \"assets\" must be an array");
  }
  for (let i = 0; i < assets.length; i++) {
    const row = assets[i];
    if (typeof row !== "object" || row === null) {
      throw new Error(`deposit-assets config: assets[${i}] must be an object`);
    }
    const e = row as Record<string, unknown>;
    if (typeof e.fireblocksAssetLegacyId !== "string" || !e.fireblocksAssetLegacyId.trim()) {
      throw new Error(`deposit-assets config: assets[${i}].fireblocksAssetLegacyId must be a non-empty string`);
    }
    if (typeof e.blockchainKey !== "string" || !e.blockchainKey.trim()) {
      throw new Error(`deposit-assets config: assets[${i}].blockchainKey must be a non-empty string`);
    }
    if (!DEPOSIT_BLOCKCHAIN_KEYS.includes(e.blockchainKey.trim().toUpperCase() as DepositAssetEntry["blockchainKey"])) {
      throw new Error(
        `deposit-assets config: assets[${i}].blockchainKey must be one of: ${DEPOSIT_BLOCKCHAIN_KEYS.join(", ")}`,
      );
    }
    if (e.fireblocksBlockchainId !== undefined && typeof e.fireblocksBlockchainId !== "string") {
      throw new Error(`deposit-assets config: assets[${i}].fireblocksBlockchainId must be a string if present`);
    }
    if (typeof e.enabled !== "boolean") {
      throw new Error(`deposit-assets config: assets[${i}].enabled must be a boolean`);
    }
    if (typeof e.sortOrder !== "number" || !Number.isFinite(e.sortOrder)) {
      throw new Error(`deposit-assets config: assets[${i}].sortOrder must be a finite number`);
    }
    if (e.label !== undefined && typeof e.label !== "string") {
      throw new Error(`deposit-assets config: assets[${i}].label must be a string if present`);
    }
  }
  return {
    assets: assets.map((row) => {
      const e = row as Record<string, unknown>;
      return {
        fireblocksAssetLegacyId: String(e.fireblocksAssetLegacyId).trim(),
        fireblocksBlockchainId:
          e.fireblocksBlockchainId === undefined ? undefined : String(e.fireblocksBlockchainId).trim(),
        blockchainKey: String(e.blockchainKey).trim().toUpperCase() as DepositAssetEntry["blockchainKey"],
        label: e.label === undefined ? undefined : String(e.label),
        enabled: Boolean(e.enabled),
        sortOrder: Number(e.sortOrder),
      } satisfies DepositAssetEntry;
    }),
  };
}

@Injectable()
export class DepositAssetsService implements OnModuleInit {
  private readonly logger = new Logger(DepositAssetsService.name);
  private config: DepositAssetsConfigFile = { assets: [] };
  private resolvedPath = "";

  onModuleInit(): void {
    this.reload();
  }

  /** 配置文件绝对路径（便于排障） */
  getResolvedPath(): string {
    return this.resolvedPath;
  }

  /** 原始配置（含 disabled 项） */
  getConfig(): DepositAssetsConfigFile {
    return { assets: [...this.config.assets] };
  }

  /** 仅 enabled=true，按 sortOrder 升序 */
  getEnabledEntries(): DepositAssetEntry[] {
    return this.config.assets
      .filter((a) => a.enabled)
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  getEnabledLegacyIds(): string[] {
    return this.getEnabledEntries().map((a) => a.fireblocksAssetLegacyId.trim());
  }

  reload(): void {
    this.resolvedPath = resolveConfigPath();
    const raw = readFileSync(this.resolvedPath, "utf8");
    this.config = parseAndValidate(raw);
    const enabled = this.getEnabledEntries();
    for (const e of enabled) {
      if (e.fireblocksAssetLegacyId.includes("REPLACE_ME")) {
        this.logger.warn(
          `Enabled deposit asset still contains placeholder id: ${e.fireblocksAssetLegacyId} (${this.resolvedPath})`,
        );
      }
    }
    this.logger.log(
      `Loaded deposit-assets from ${this.resolvedPath} (total ${this.config.assets.length}, enabled ${enabled.length})`,
    );
  }
}
