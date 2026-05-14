import { ApiProperty } from '@nestjs/swagger'
import { MfaTicket } from '../entities'

export class LoginRequestDto {
  @ApiProperty()
  email: string

  @ApiProperty()
  password: string
}

export class LoginResponseDto {
  @ApiProperty()
  mfaRequired: boolean

  @ApiProperty({ required: false, type: MfaTicket })
  mfaTicket?: MfaTicket

  @ApiProperty({ required: false })
  accessToken?: string

  @ApiProperty({ required: false })
  refreshToken?: string
}

export class AuthenticateRequestDto {
  @ApiProperty()
  ticket: string

  @ApiProperty()
  type: string

  @ApiProperty()
  code: string
}

export class AuthenticateResponseDto {
  @ApiProperty({ required: false, type: MfaTicket })
  mfaTicket?: MfaTicket

  @ApiProperty({ required: false })
  accessToken?: string

  @ApiProperty({ required: false })
  refreshToken?: string
}

export class BackupAuthenticateRequestDto {
  @ApiProperty()
  ticket: string

  @ApiProperty()
  backupCode: string
}

export class RefreshTokenRequestDto {
  @ApiProperty()
  refreshToken: string
}

export class TokenPairDto {
  @ApiProperty()
  accessToken: string

  @ApiProperty()
  refreshToken: string
}
