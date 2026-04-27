import { Controller, Get } from "@nestjs/common";
import { DepositAssetsService } from "./deposit-assets.service";

@Controller("config/deposit-assets")
export class DepositAssetsController {
  constructor(private readonly depositAssetsService: DepositAssetsService) {}

  @Get()
  listConfig() {
    return this.depositAssetsService.listConfig();
  }
}
