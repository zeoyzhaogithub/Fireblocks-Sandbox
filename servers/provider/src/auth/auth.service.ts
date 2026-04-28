import { BadRequestException, Injectable } from "@nestjs/common";
import type { LoginDto } from "./dto/login.dto";
import { UsersService } from "../users/users.service";
import { WalletOnboardingService } from "../wallet-onboarding/wallet-onboarding.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly walletOnboardingService: WalletOnboardingService,
  ) {}

  async login(input: LoginDto) {
    const email = input.email?.trim();
    if (!email) {
      throw new BadRequestException("email is required");
    }
    const user = await this.usersService.loginByEmail(email);
    const wallet = await this.walletOnboardingService.ensureUserWallets({
      userId: user.id,
      email,
    });
    return {
      user,
      wallet,
      message: "login success",
    };
  }
}
