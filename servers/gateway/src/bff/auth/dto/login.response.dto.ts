import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class LoginUserDto {
  @ApiProperty({ example: "clx1234567890abcdef" })
  id!: string;

  @ApiPropertyOptional({ example: "demo@example.com" })
  email?: string;

  @ApiPropertyOptional({ example: "2026-04-27T08:21:00.000Z" })
  emailVerifiedAt?: string;

  @ApiProperty({ example: "2026-04-27T08:21:00.000Z" })
  createdAt!: string;

  @ApiPropertyOptional({ example: "2026-04-27T08:21:00.000Z" })
  lastLoginAt?: string;

  @ApiProperty({ example: 3 })
  loginCount!: number;
}

export class LoginResponseDto {
  @ApiProperty({ type: LoginUserDto })
  user!: LoginUserDto;

  @ApiProperty({ example: "login success" })
  message!: string;
}
