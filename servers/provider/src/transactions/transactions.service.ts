import { Inject, Injectable } from "@nestjs/common";
import { getTransactionById, listTransactions } from "@service/fireblocks";
import { TransactionsRepository } from "./transactions.repository";

@Injectable()
export class TransactionsService {
  constructor(@Inject(TransactionsRepository) private readonly transactionsRepository: TransactionsRepository) {}

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
}
