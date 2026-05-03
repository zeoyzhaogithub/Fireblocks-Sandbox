import type { TransactionsApiGetTransactionRequest, TransactionsApiGetTransactionsRequest } from "@fireblocks/ts-sdk";
import { getFireblocksClient } from "../client";

export async function getTransactionById(params: TransactionsApiGetTransactionRequest) {
  const response = await getFireblocksClient().transactions.getTransaction(params);
  return response.data;
}

export async function listTransactions(params: TransactionsApiGetTransactionsRequest = {}) {
  const response = await getFireblocksClient().transactions.getTransactions(params);
  return response.data;
}

export interface CreateVaultToVaultTransferInput {
  sourceVaultAccountId: string;
  destinationVaultAccountId: string;
  assetId: string;
  amount: string;
  note?: string;
  externalTxId?: string;
}

/**
 * 创建一笔 Fireblocks Vault -> Vault 转账交易（沙盒可用于模拟转账流程）。
 */
export async function createVaultToVaultTransfer(input: CreateVaultToVaultTransferInput) {
  const response = await (getFireblocksClient().transactions as any).createTransaction({
    transactionRequest: {
      operation: "TRANSFER",
      source: {
        type: "VAULT_ACCOUNT",
        id: input.sourceVaultAccountId,
      },
      destination: {
        type: "VAULT_ACCOUNT",
        id: input.destinationVaultAccountId,
      },
      assetId: input.assetId,
      amount: input.amount,
      note: input.note,
      externalTxId: input.externalTxId,
    },
  });

  return response.data;
}
