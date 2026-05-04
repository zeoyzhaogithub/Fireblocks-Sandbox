import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { createVaultToVaultTransfer, getTransactionById, listTransactions } from "@service/fireblocks";
import { CreateTransferDto } from "./dto/create-transfer.dto";
import { TransactionsRepository } from "./transactions.repository";

@Injectable()
export class TransactionsService {
  constructor(@Inject(TransactionsRepository) private readonly transactionsRepository: TransactionsRepository) {}

  /**
   * 调用 Fireblocks 列表接口并做参数兜底：
   * - limit 限制在 1~500（默认 100）
   * - 空字符串参数归一化为 undefined
   * - 拉取后记录一次查询快照（当前为占位实现）
   */
  async listTransactions(
    limit?: string,
    next?: string,
    prev?: string,
    before?: string,
    after?: string,
    status?: string,
  ) {
    const parsedLimit = Number(limit);
    const safeLimit = Number.isFinite(parsedLimit)
      ? Math.min(Math.max(Math.trunc(parsedLimit), 1), 500)
      : 100;

    const data = await listTransactions({
      limit: safeLimit,
      next: next?.trim() || undefined,
      prev: prev?.trim() || undefined,
      before: before?.trim() || undefined,
      after: after?.trim() || undefined,
      status: status?.trim() || undefined,
    });

    await this.transactionsRepository.saveListSnapshot({
      limit: safeLimit,
      count: data.length,
      fetchedAt: Date.now(),
    });

    return data;
  }

  /**
   * 查询单笔 Fireblocks 交易详情，并记录查询快照（当前为占位实现）。
   */
  async getTransaction(txId: string) {
    const data = await getTransactionById({ txId });

    await this.transactionsRepository.saveQuerySnapshot({
      txId,
      status: data.status,
      subStatus: data.subStatus,
      fetchedAt: Date.now(),
    });

    return data;
  }

  /**
   * 创建一笔 Vault -> Vault 转账交易（用于沙盒模拟转账）。
   */
  async createTransfer(input: CreateTransferDto) {
    const payload = {
      sourceVaultAccountId: input.sourceVaultAccountId.trim(),
      destinationVaultAccountId: input.destinationVaultAccountId.trim(),
      assetId: input.assetId.trim(),
      amount: input.amount.trim(),
      externalTxId: input.externalTxId?.trim() || undefined,
      note: input.note?.trim() || undefined,
    };

    const sourceUserId = await this.transactionsRepository.findUserIdByVaultAccountId(payload.sourceVaultAccountId);
    const destinationUserId = await this.transactionsRepository.findUserIdByVaultAccountId(payload.destinationVaultAccountId);
    if (!sourceUserId || !destinationUserId) {
      throw new BadRequestException(
        "sourceVaultAccountId 或 destinationVaultAccountId 未关联到本地用户，无法同步写入 Transaction",
      );
    }

    const data = await createVaultToVaultTransfer(payload);

    const txId = typeof data?.id === "string" ? data.id : undefined;
    const txHash = typeof data?.txHash === "string" ? data.txHash : undefined;
    const status = typeof data?.status === "string" ? data.status.toUpperCase() : "PENDING";
    const mappedStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED"
      = status === "COMPLETED"
        ? "COMPLETED"
        : status === "FAILED"
          ? "FAILED"
          : status === "CANCELLED"
            ? "CANCELLED"
            : "PROCESSING";

    // 两条 Transaction：转出 WITHDRAWAL、转入 DEPOSIT（custodyTxId 仅记在转出侧 detail）
    await this.transactionsRepository.createTransferFlowRecords({
      sourceUserId,
      destinationUserId,
      status: mappedStatus,
      assetCode: payload.assetId,
      amount: payload.amount,
      sourceAddress: `vault:${payload.sourceVaultAccountId}`,
      destinationAddress: `vault:${payload.destinationVaultAccountId}`,
      txHash,
      custodyTxId: txId,
    });

    await this.transactionsRepository.saveCreateSnapshot({
      type: "VAULT_TO_VAULT_TRANSFER",
      request: payload,
      txId: data?.id,
      status: data?.status,
      subStatus: data?.subStatus,
      createdAt: Date.now(),
    });

    return data;
  }
}
