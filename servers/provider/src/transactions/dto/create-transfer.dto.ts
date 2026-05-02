import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateTransferDto {
  @IsString()
  @IsNotEmpty()
  sourceVaultAccountId!: string;

  @IsString()
  @IsNotEmpty()
  destinationVaultAccountId!: string;

  @IsString()
  @IsNotEmpty()
  assetId!: string;

  @IsString()
  @IsNotEmpty()
  amount!: string;

  @IsOptional()
  @IsString()
  externalTxId?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
