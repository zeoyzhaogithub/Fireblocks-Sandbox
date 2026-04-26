import { Inject, Injectable } from "@nestjs/common";
import { listAssets } from "@service/fireblocks";
import { AssetsRepository } from "./assets.repository";

@Injectable()
export class AssetsService {
  constructor(@Inject(AssetsRepository) private readonly assetsRepository: AssetsRepository) {}

  async listAssets() {
    const pageSize = 500;
    let pageCursor: string | undefined;
    const allData: unknown[] = [];

    do {
      const page = await listAssets({
        pageSize,
        pageCursor,
      });
      allData.push(...(page.data ?? []));
      pageCursor = page.next ?? undefined;
    } while (pageCursor);

    await this.assetsRepository.saveListSnapshot({
      pageSize,
      hasNextPage: false,
      count: allData.length,
      fetchedAt: Date.now(),
    });

    return {
      data: allData,
      total: allData.length,
    };
  }
}
