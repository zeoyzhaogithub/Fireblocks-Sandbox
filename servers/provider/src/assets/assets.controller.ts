import { Controller, Get, Inject } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AssetsService } from "./assets.service";

@ApiTags("fireblocks-assets")
@Controller()
export class AssetsController {
  constructor(@Inject(AssetsService) private readonly assetsService: AssetsService) {}

  @Get("assets")
  @ApiOperation({
    summary: "List all supported Fireblocks assets",
    description: "Returns all assets available in the current Fireblocks workspace by internally iterating all pages.",
  })
  @ApiOkResponse({
    description: "All assets list",
    schema: {
      example: {
        total: 2,
        data: [
          {
            id: "015f1506-6d73-42b4-b41c-735b1b0bf828",
            legacyId: "XDB_TEST",
            metadata: {
              scope: "GLOBAL",
              verified: true,
              deprecated: false,
              media: [
                {
                  url: "https://sandbox-static.fireblocks.io/storage-service/c648b1b5-c271-4ae0-8f8c-f4bcf092376b",
                  type: "image/svg+xml",
                },
              ],
            },
            blockchainId: "8eceec87-c3c2-47cc-9c5c-0f87eb40a563",
            displayName: "Test DigitalBits",
            displaySymbol: "XDB",
            assetClass: "NATIVE",
            onchain: {
              symbol: "XDB_TEST",
              name: "XDB Test",
              decimals: 7,
            },
          },
          {
            id: "032f223a-cb26-48ba-9b72-c001ff5d4a42",
            legacyId: "PEERACCOUNTTRANSFER_USD_TEST",
            metadata: {
              scope: "GLOBAL",
              verified: false,
              deprecated: false,
            },
            assetClass: "FIAT",
            displayName: "USD (Peer Transfer test)",
            displaySymbol: "USD",
            decimals: 2,
          },
        ],
      },
    },
  })
  async listAssets() {
    return this.assetsService.listAssets();
  }
}
