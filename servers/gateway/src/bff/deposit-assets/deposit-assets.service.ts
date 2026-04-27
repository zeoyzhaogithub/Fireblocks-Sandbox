import { Injectable } from "@nestjs/common";
import { ProviderClient } from "../../provider-client/provider.client";

@Injectable()
export class DepositAssetsService {
  constructor(private readonly providerClient: ProviderClient) {}

  listConfig() {
    return this.providerClient.getDepositAssetsConfig();
  }
}
