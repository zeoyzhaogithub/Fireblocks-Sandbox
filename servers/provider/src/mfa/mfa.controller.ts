import { BadRequestException, Body, ConflictException, Controller, Get, Inject, Ip, Param, Post, Session, UnauthorizedException, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { MfaRecordStatus } from '@service/database/client'
import { prisma } from '@service/database'
import { redis } from '@service/redis'
import { AuthGuard } from '../auth/auth.guard'
import { Logged } from '../user/entities'
import { VerificationService } from '../verification/verification.service'
import { CreateMfaTicketRequestDto, VerifyMfaFactorRequestDto } from './dtos'
import { Ticket } from './entities'
import { MfaService } from './mfa.service'
import { MfaActions } from './types'

@ApiTags('MFA')
@Controller('mfa')
export class MfaController {
  constructor(
    @Inject(MfaService) private readonly service: MfaService,
    @Inject(VerificationService) private readonly verification: VerificationService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @Throttle({ default: { ttl: 1000, limit: 3 } })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, type: Ticket })
  @ApiOperation({ summary: '创建 MFA 会话 ticket', description: '在密码等前置校验通过后，为一次 MFA 流程创建 ticket。' })
  async create(
    @Session() session: Logged,
    @Body() body: CreateMfaTicketRequestDto,
    @Ip() ip: string,
  ) {
    return this.service.create(session.user.id, body.action, ip)
  }

  @Get(':action')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'action', enum: MfaActions })
  @ApiResponse({ status: 200, type: Ticket })
  @ApiOperation({ summary: '查询 MFA 会话状态', description: '查询 MFA 会话状态，返回已认证的因子和还需要认证的因子。' })
  async find(
    @Session() session: Logged,
    @Param('action') action: MfaActions,
  ) {
    return this.service.find(session.user.id, action)
  }

  @Post('verify')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 200 })
  @ApiOperation({ summary: '验证 MFA 某一因子', description: '提交 ticket、因子类型与动态码，推进 MFA 进度。' })
  async verify(
    @Session() session: Logged,
    @Body() body: VerifyMfaFactorRequestDto,
    @Ip() ip: string,
  ) {
    const ticketJson = await redis.getex(`ticket:${session.user.id}:${body.action}`)
    if (!ticketJson)
      throw new BadRequestException('MFA session not found')

    const ticket = JSON.parse(ticketJson) as Ticket

    if (ticket.verified.includes(body.type))
      throw new ConflictException('This factor has already been verified')

    if (!ticket.required.includes(body.type))
      throw new ConflictException('This factor is not required for the current action')

    if (ticket.ip !== ip)
      throw new UnauthorizedException('IP address mismatch')

    await this.verification.verify(
      body.type,
      session.user.id,
      body.code,
    )

    ticket.verified.push(body.type)

    await redis.set(
      `ticket:${session.user.id}:${body.action}`,
      JSON.stringify(ticket),
      'KEEPTTL',
    )

    if (ticket.verified.length === ticket.required.length) {
      await redis.del(`ticket:${session.user.id}:${body.action}`)
      await prisma.mfa.update({
        where: { id: BigInt(ticket.id) },
        data: { status: MfaRecordStatus.SUCCESS },
      })
    }
  }
}
