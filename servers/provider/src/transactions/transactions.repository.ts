import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class TransactionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserIdByVaultAccountId(vaultAccountId: string): Promise<string | null> {
    const user = await this.prisma.user.findFirst({
      where: { vault_account_id: vaultAccountId },
      select: { id: true },
    });
    return user?.id ?? null;
  }

  async ensureWalletAccountByUserId(userId: string): Promise<string> {
    const account = await this.prisma.walletAccount.upsert({
      where: { user_id: userId },
      create: { user_id: userId },
      update: {},
      select: { id: true },
    });
    return account.id;
  }

  async createWalletFlowRecord(input: {
    walletAccountId: string;
    flowType: "DEPOSIT" | "WITHDRAWAL";
    status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
    assetCode: string;
    network?: string;
    address: string;
    amount: string;
    feeAmount?: string;
    custodyTxId?: string;
    txHash?: string;
    failReason?: string;
  }): Promise<void> {
    await this.prisma.walletFlowRecord.create({
      data: {
        wallet_account_id: input.walletAccountId,
        flow_type: input.flowType,
        status: input.status,
        asset_code: input.assetCode,
        network: input.network,
        address: input.address,
        amount: input.amount,
        fee_amount: input.feeAmount,
        custody_tx_id: input.custodyTxId,
        tx_hash: input.txHash,
        fail_reason: input.failReason,
      },
      select: { id: true },
    });
  }

  async createTransferFlowRecords(input: {
    sourceWalletAccountId: string;
    destinationWalletAccountId: string;
    status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
    assetCode: string;
    amount: string;
    sourceAddress: string;
    destinationAddress: string;
    txHash?: string;
    custodyTxId?: string;
  }): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.walletFlowRecord.create({
        data: {
          wallet_account_id: input.sourceWalletAccountId,
          flow_type: "WITHDRAWAL",
          status: input.status,
          asset_code: input.assetCode,
          address: input.destinationAddress,
          amount: input.amount,
          custody_tx_id: input.custodyTxId,
          tx_hash: input.txHash,
        },
        select: { id: true },
      }),
      this.prisma.walletFlowRecord.create({
        data: {
          wallet_account_id: input.destinationWalletAccountId,
          flow_type: "DEPOSIT",
          status: input.status,
          asset_code: input.assetCode,
          address: input.sourceAddress,
          amount: input.amount,
          tx_hash: input.txHash,
        },
        select: { id: true },
      }),
    ]);
  }

  /**
   * 预留：落库单笔交易查询快照（用于审计/排障追踪）。
   */
  async saveQuerySnapshot(_payload: unknown): Promise<void> {
    // TODO: persist to database when DB layer is ready.
  }

  /**
   * 预留：落库交易列表查询快照（用于统计/审计）。
   */
  async saveListSnapshot(_payload: unknown): Promise<void> {
    // TODO: persist to database when DB layer is ready.
  }

  /**
   * 预留：落库交易创建请求与结果快照（用于审计/重放排障）。
   */
  async saveCreateSnapshot(_payload: unknown): Promise<void> {
    // TODO: persist to database when DB layer is ready.
  }
}
