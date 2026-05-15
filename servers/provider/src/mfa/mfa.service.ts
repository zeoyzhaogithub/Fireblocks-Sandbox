import process from 'node:process'
import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { prisma } from '@service/database'
import { redis } from '@service/redis'
import { Ticket } from './entities'
import { MfaActions } from './types'

@Injectable()
export class MfaService {
  private readonly logger = new Logger(MfaService.name)

  async create(userId: string, action: MfaActions, ip: string) {
    const existing = await redis.getex(`ticket:${userId}:${action}`)
    if (existing)
      await redis.del(`ticket:${userId}:${action}`)

    const authenticators = await prisma.authenticator.findMany({
      where: { userId },
    })

    const methods = authenticators.map(a => a.type)
    const { id } = await prisma.mfa.create({
      data: {
        user_id: userId,
        action,
        method: methods,
        ip,
      },
    })

    const ticket: Ticket = {
      required: authenticators.map(a => a.type),
      verified: [],
      action,
      userId,
      id: id.toString(),
      ip,
    }

    await redis.setex(
      `ticket:${userId}:${action}`,
      60 * 15,
      JSON.stringify(ticket),
    )

    return ticket
  }

  async verify(userId: string, action: MfaActions) {
    if (process.env.MFA_DISABLED === 'true') {
      this.logger.warn(`MFA is disabled. Automatically passing MFA check for user ${userId} and action ${action}`)
      return
    }
    const ticket = await this.find(userId, action)
    if (ticket.verified.length !== ticket.required.length)
      throw new UnauthorizedException('MFA verification incomplete')
    this.logger.log(`MFA check successful for user ${userId} and action ${action}`)
  }

  async find(userId: string, action: MfaActions) {
    const existing = await redis.getex(`ticket:${userId}:${action}`)
    if (!existing)
      throw new NotFoundException('MFA session not found')
    return JSON.parse(existing) as Ticket
  }
}
