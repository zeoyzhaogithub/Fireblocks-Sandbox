import { Injectable } from "@nestjs/common";
import { ProviderClient } from "../../provider-client/provider.client";
import { LoginDto } from "./dto/login.dto";
import type { LoginResponseDto } from "./dto/login.response.dto";

@Injectable()
export class AuthService {
  constructor(private readonly providerClient: ProviderClient) {}

  login(input: LoginDto): Promise<LoginResponseDto> {
    return this.providerClient.login(input);
  }
}
