import { ApiProperty } from '@nestjs/swagger'
import { AuthenticatorType } from '@service/database/prisma'

export enum MfaStatus {
  SUCCESS = 'SUCCESS',
  EXPIRED = 'EXPIRED',
}

// redis
export class Ticket {
  @ApiProperty()
  id: string

  @ApiProperty()
  userId: string

  @ApiProperty()
  action: string

  @ApiProperty({ isArray: true })
  verified: AuthenticatorType[]

  @ApiProperty()
  required: AuthenticatorType[]

  @ApiProperty({ required: false })
  ip: string
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

  @ApiProperty({ enum: AuthenticatorType })
  method: AuthenticatorType

  @ApiProperty({ required: false })
  ip: string

  @ApiProperty({ required: false })
  failReason?: string

  @ApiProperty()
  createdAt: string
}
