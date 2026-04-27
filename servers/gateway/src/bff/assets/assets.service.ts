import { Injectable } from "@nestjs/common";
import { ProviderClient } from "../../provider-client/provider.client";

@Injectable()
export class AssetsService {
  constructor(private readonly providerClient: ProviderClient) {}

  list() {
    return this.providerClient.getAssets();
  }
}
