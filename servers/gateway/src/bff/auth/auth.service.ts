import { Injectable } from "@nestjs/common";
import { ProviderClient } from "../../provider-client/provider.client";
import type { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(private readonly providerClient: ProviderClient) {}

  login(input: LoginDto) {
    return this.providerClient.login(input);
  }
}
