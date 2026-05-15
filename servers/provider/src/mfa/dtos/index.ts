import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { AuthenticatorType } from '@/modules/authenticator/entities'
import { MfaActions } from '../types'

export class CreateMfaTicketRequestDto {
  @ApiProperty({
    example: 'LOGIN',
    description: '触发 MFA 的动作，如 LOGIN、SENSITIVE_TRANSFER',
    enum: MfaActions,
  })
  @IsNotEmpty()
  action: MfaActions
}

export class VerifyMfaFactorRequestDto {
  @ApiProperty({ description: 'MFA 会话 ticket' })
  @IsNotEmpty()
  action: string

  @ApiProperty({ enum: AuthenticatorType, description: '本次验证的因子类型' })
  @IsNotEmpty()
  type: AuthenticatorType

  @ApiProperty({ description: '动态码' })
  @IsNotEmpty()
  code: string
}
