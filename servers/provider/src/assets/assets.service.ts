import { Inject, Injectable } from "@nestjs/common";
import { listAssets } from "@service/fireblocks";
import { AssetsRepository } from "./assets.repository";

@Injectable()
export class AssetsService {
  constructor(@Inject(AssetsRepository) private readonly assetsRepository: AssetsRepository) {}

  async listAssets(pageSize?: string, pageCursor?: string) {
    const parsedPageSize = Number(pageSize);
    const safePageSize = Number.isFinite(parsedPageSize)
      ? Math.min(Math.max(Math.trunc(parsedPageSize), 1), 500)
      : 100;

    const data = await listAssets({
      pageSize: safePageSize,
      pageCursor: pageCursor?.trim() || undefined,
    });

    await this.assetsRepository.saveListSnapshot({
      pageSize: safePageSize,
      hasNextPage: Boolean(data.next),
      count: data.data?.length ?? 0,
      fetchedAt: Date.now(),
    });

    return data;
  }
}
