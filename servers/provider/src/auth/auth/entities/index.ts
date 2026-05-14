import { ApiProperty } from '@nestjs/swagger'
import { AuthenticatorType } from '@service/database/prisma'

export enum MfaStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  BLOCKED = 'BLOCKED',
  EXPIRED = 'EXPIRED',
}

// redis
export class MfaTicket {
  @ApiProperty()
  userId: string

  @ApiProperty()
  action: string // RESET_PASSWORD, LOGIN

  @ApiProperty({ required: false })
  resourceId?: string

  @ApiProperty({ isArray: true })
  verifiedSteps: AuthenticatorType[] // 用户已经认证了哪些方法

  @ApiProperty()
  requiredSteps: AuthenticatorType[] // [goole TOTP, email OTP, ...] 取决于用户启用了哪些方法
}

// database
export class Mfa {
  @ApiProperty()
  id: bigint

  @ApiProperty()
  userId: string

  @ApiProperty({ enum: MfaStatus })
  status: MfaStatus

  @ApiProperty()
  action: string

  @ApiProperty({ required: false })
  resourceId?: string

  @ApiProperty({ enum: AuthenticatorType })
  method: AuthenticatorType

  @ApiProperty({ required: false })
  ip: string

  @ApiProperty({ required: false })
  failReason?: string

  @ApiProperty()
  createdAt: string
}
