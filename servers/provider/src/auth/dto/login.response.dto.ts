import { ApiProperty } from "@nestjs/swagger";

class LoginUserDto {
  @ApiProperty({ example: "clx1234567890abcdef" })
  id!: string;

  @ApiProperty({ example: "demo@example.com", nullable: true })
  email!: string | null;

  @ApiProperty({ example: "2026-04-28T01:39:00.000Z", nullable: true })
  emailVerifiedAt!: string | null;

  @ApiProperty({ example: "2026-04-28T01:39:00.000Z", nullable: true })
  lastLoginAt!: string | null;

  @ApiProperty({ example: 1 })
  loginCount!: number;

  @ApiProperty({ example: "2026-04-28T01:39:00.000Z" })
  createdAt!: string;
}

class SyncedAddressDto {
  @ApiProperty({ example: "USDT_TRX" })
  assetLegacyId!: string;

  @ApiProperty({ example: "TRON" })
  blockchainKey!: string;

  @ApiProperty({ example: "TQ3s..." })
  address!: string;

  @ApiProperty({ example: "", required: false, nullable: true })
  tag?: string;
}

class WalletOnboardingResultDto {
  @ApiProperty({ example: "123456789" })
  vaultAccountId!: string;

  @ApiProperty({ example: true })
  createdVault!: boolean;

  @ApiProperty({ type: [SyncedAddressDto] })
  syncedAddresses!: SyncedAddressDto[];

  @ApiProperty({ example: "demo@example.com" })
  email!: string;
}

export class LoginResponseDto {
  @ApiProperty({ type: LoginUserDto })
  user!: LoginUserDto;

  @ApiProperty({ type: WalletOnboardingResultDto })
  wallet!: WalletOnboardingResultDto;

  @ApiProperty({ example: "login success" })
  message!: string;
}
