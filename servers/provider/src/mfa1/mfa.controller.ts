import { Body, Controller, Inject, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { CreateMfaTicketRequestDto, VerifyMfaFactorRequestDto } from './dtos'
import { MfaService } from './mfa.service'

@ApiTags('MFA')
@Controller('mfa')
export class MfaController {
  constructor(
    @Inject(MfaService) private readonly mfaService: MfaService,
  ) {}

  @Post('create')
  @ApiOperation({
    summary: '创建 MFA 会话 ticket',
    description: '在密码等前置校验通过后，为一次 MFA 流程创建 ticket（与 `MfaService.createTicket` 一致）。',
  })
  create(@Body() body: CreateMfaTicketRequestDto) {
    return this.mfaService.createTicket({
      userId: body.userId,
      action: body.action,
      resourceId: body.resourceId,
      context: body.ip !== undefined ? { ip: body.ip } : undefined,
    })
  }

  @Post('verify')
  @ApiOperation({
    summary: '验证 MFA 某一因子',
    description: '提交 ticket、因子类型与动态码，推进 MFA 会话（与 `MfaService.verifyFactor` 一致）。',
  })
  verify(@Body() body: VerifyMfaFactorRequestDto) {
    return this.mfaService.verifyFactor({
      ticket: body.ticket,
      type: body.type,
      code: body.code,
      context: { ip: body.ip },
    })
  }
}
