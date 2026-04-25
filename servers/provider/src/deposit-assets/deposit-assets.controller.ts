import { Controller, Get, Inject } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { DepositAssetsService } from "./deposit-assets.service";

@ApiTags("provider-config")
@Controller("config")
export class DepositAssetsController {
  constructor(@Inject(DepositAssetsService) private readonly depositAssetsService: DepositAssetsService) {}

  @Get("deposit-assets")
  @ApiOperation({
    summary: "List configured deposit assets (provider-local)",
    description:
      "Returns the version-controlled deposit asset list used when provisioning vault wallets (Fireblocks legacy asset ids). Disabled entries are included for visibility; only enabled entries are used by orchestration.",
  })
  @ApiOkResponse({
    description: "Deposit assets config snapshot",
    schema: {
      example: {
        configPath: "/path/to/servers/provider/config/deposit-assets.json",
        assets: [
          {
            fireblocksAssetLegacyId: "TRX_USDT_S2UNNJ",
            blockchainKey: "TRON",
            label: "USDT (TRON)",
            enabled: true,
            sortOrder: 10,
          },
        ],
        enabledLegacyIds: ["TRX_USDT_S2UNNJ"],
      },
    },
  })
  getDepositAssetsConfig() {
    const cfg = this.depositAssetsService.getConfig();
    return {
      configPath: this.depositAssetsService.getResolvedPath(),
      assets: cfg.assets,
      enabledLegacyIds: this.depositAssetsService.getEnabledLegacyIds(),
    };
  }
}
