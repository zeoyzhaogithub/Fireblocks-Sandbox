import { Injectable } from "@nestjs/common";

@Injectable()
export class TransactionsRepository {
  async saveQuerySnapshot(_payload: unknown): Promise<void> {
    // TODO: persist to database when DB layer is ready.
  }

  async saveListSnapshot(_payload: unknown): Promise<void> {
    // TODO: persist to database when DB layer is ready.
  }
}
