import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import type { LoginDto } from "./dto/login.dto";
import { UsersService } from "../users/users.service";
import { WalletOnboardingService } from "../wallet-onboarding/wallet-onboarding.service";

@Injectable()
export class AuthService {
  constructor(
    @Inject(UsersService) private readonly usersService: UsersService,
    @Inject(WalletOnboardingService) private readonly walletOnboardingService: WalletOnboardingService,
  ) {}

  async login(input: LoginDto) {
    const email = input.email?.trim();
    if (!email) {
      throw new BadRequestException("email is required");
    }
    // login by email and create or update user data in the user table with email as the unique identifier
    const user = await this.usersService.loginByEmail(email);
    // ensure user wallets and create or update wallet data in the user_custody_vaults table with user id as the unique identifier
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
