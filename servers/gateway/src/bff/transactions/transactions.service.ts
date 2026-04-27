import { Injectable } from "@nestjs/common";
import { ProviderClient } from "../../provider-client/provider.client";

@Injectable()
export class TransactionsService {
  constructor(private readonly providerClient: ProviderClient) {}

  list(query: { before?: string; after?: string; limit?: number }) {
    return this.providerClient.getTransactions(query);
  }

  getById(txId: string) {
    return this.providerClient.getTransactionById(txId);
  }
}
