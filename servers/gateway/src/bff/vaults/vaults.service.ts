import { Injectable } from "@nestjs/common";
import { ProviderClient } from "../../provider-client/provider.client";

@Injectable()
export class VaultsService {
  constructor(private readonly providerClient: ProviderClient) {}

  list() {
    return this.providerClient.getVaults();
  }
}
