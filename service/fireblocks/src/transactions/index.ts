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
