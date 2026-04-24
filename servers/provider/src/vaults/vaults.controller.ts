import { Controller, Get, Inject, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { VaultsService } from "./vaults.service";

@ApiTags("fireblocks-vaults")
@Controller()
export class VaultsController {
  constructor(@Inject(VaultsService) private readonly vaultsService: VaultsService) {}

  @Get("vaults")
  @ApiOperation({
    summary: "List Fireblocks vault accounts (paginated)",
    description:
      "Returns paginated vault accounts from Fireblocks workspace, including account-level metadata and asset balances.",
  })
  @ApiQuery({ name: "limit", required: false, description: "Page size (1-500)" })
  @ApiQuery({ name: "after", required: false, description: "Cursor for next page" })
  @ApiQuery({ name: "before", required: false, description: "Cursor for previous page" })
  @ApiQuery({ name: "assetId", required: false, description: "Filter by asset ID" })
  @ApiOkResponse({
    description: "Paginated vault accounts list",
    schema: {
      example: {
        accounts: [
          {
            id: "2",
            name: "test",
            hiddenOnUI: false,
            autoFuel: true,
            assets: [],
          },
          {
            id: "1",
            name: "My First Vault Account",
            hiddenOnUI: false,
            autoFuel: false,
            assets: [],
          },
          {
            id: "0",
            name: "Default",
            hiddenOnUI: false,
            autoFuel: false,
            assets: [
              {
                id: "BTC_TEST",
                total: "0",
                balance: "0",
                lockedAmount: "0",
                available: "0",
                pending: "0",
                frozen: "0",
                staked: "0",
                blockHeight: "4839665",
              },
              {
                id: "ETH_TEST5",
                total: "0",
                balance: "0",
                lockedAmount: "0",
                available: "0",
                pending: "0",
                frozen: "0",
                staked: "0",
                blockHeight: "-1",
              },
            ],
          },
        ],
        paging: {
          after: "next-cursor",
          before: null,
        },
        nextUrl: "https://sandbox-api.fireblocks.io/v1/vault/accounts_paged?after=next-cursor",
        previousUrl: null,
      },
    },
  })
  async listVaults(
    @Query("limit") limit?: string,
    @Query("after") after?: string,
    @Query("before") before?: string,
    @Query("assetId") assetId?: string,
  ) {
    return this.vaultsService.listVaults(limit, after, before, assetId);
  }
}
