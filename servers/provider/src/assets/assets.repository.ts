import { Injectable } from "@nestjs/common";

@Injectable()
export class AssetsRepository {
  async saveListSnapshot(_payload: unknown): Promise<void> {
    // TODO: persist to database when DB layer is ready.
  }
}
