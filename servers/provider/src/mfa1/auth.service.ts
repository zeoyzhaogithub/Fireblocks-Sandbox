import { Injectable, Logger } from '@nestjs/common'
import { MfaService } from '../mfa/mfa.service'

export interface AuthClientContext {
  ip: string
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(private readonly mfa: MfaService) {}

  /**
   * 登出：吊销 refresh、清理服务端会话。
   *
   * **与 `MfaService` 的关系**
   * 若客户端仍持有未完成的 MFA `ticket`，应调用 `MfaService.revokeTicket(ticket, 'logout')`，避免 ticket 长期有效。
   *
   * @param input 可选登出入参对象
   * @param input.ticket 若存在，将调用 `MfaService.revokeTicket` 撤销未完成之 MFA 会话；其余字段随实现扩展
   */
  async logout(input?: { ticket?: string }) {
    if (input?.ticket)
      await this.mfa.revokeTicket(input.ticket, 'logout')
    return { status: 'not_implemented' as const }
  }
}
