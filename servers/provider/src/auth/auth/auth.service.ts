import type { AuthenticatorType } from '@service/database/client'
import { Injectable, Logger } from '@nestjs/common'
import { MfaService } from "../../mfa/mfa.service";

export interface AuthClientContext {
  ip: string
}

/**
 * 认证编排服务。
 *
 * **与 MFA 协作的最小闭环（建议由本类实现、供 `AuthController` 调用）**
 * — `login`：密码通过后分支 `isMfaRequiredForUser` → 需要则 `createTicket`；
 * — `authenticateMfa`：`getTicket` + `verifyFactor`，全部通过后签发 JWT（由本类后续接 `JwtService`）。
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(private readonly mfa: MfaService) {}

  /**
   * 第一步登录：校验账号密码，并按需进入 MFA。
   *
   * **职责顺序（实现时逐项补齐）**
   * 1. 按邮箱（或用户名）加载用户；不存在则返回统一错误（勿区分枚举）。
   * 2. 校验账号状态（如 `SUSPENDED`）；非法则拒绝。
   * 3. 比对密码哈希；失败则记录限流/审计并拒绝。
   * 4. 调用 `MfaService.isMfaRequiredForUser(user.id)`：
   *    - 为 `false`：直接签发 `accessToken`（及可选 `refreshToken`），`mfaRequired: false`。
   *    - 为 `true`：调用 `MfaService.createTicket({ userId, action: 'LOGIN', context })`，
   *      将返回的 `ticket` 与 `MfaService.resolveRequiredSteps` 得到的步骤列表返回给客户端，`mfaRequired: true`，**不**发业务 JWT。
   *
   * @param input 第一步入参对象
   * @param input.email 登录标识（与 `LoginRequestDto` 一致）
   * @param input.password 明文密码（仅在校验链路中存在，禁止记录日志）
   * @param context 请求上下文，供 MFA ticket 与审计
   * @returns 联合结果：`mfaRequired` 与 `ticket` / `requiredSteps` 或 `accessToken` 等（与 `LoginResponseDto` 对齐）
   */
  async login(input: { email: string, password: string }, context: AuthClientContext) {
    this.logger.debug({ msg: 'login', email: input.email, ip: context.ip })
    void input.password
    // 占位：接入用户仓储与密码校验后，再调用：
    // const mfaRequired = await this.mfa.isMfaRequiredForUser(user.id)
    // if (mfaRequired) { const ticket = await this.mfa.createTicket({ userId: user.id, action: 'LOGIN', context }) … }
    return { mfaRequired: false as const }
  }

  /**
   * 第二步 MFA：凭 `ticket` 与某一因子验证码推进会话，全部因子通过后签发 JWT。
   *
   * **职责顺序（实现时逐项补齐）**
   * 1. 使用 `MfaService.getTicket(ticket)`（或在 `verifyFactor` 内部统一读取）确认会话存在且未过期。
   * 2. 调用 `MfaService.verifyFactor({ ticket, type, code, context })`，按返回状态区分：
   *    - `in_progress`：返回当前 ticket 载荷或剩余步骤，**不**签发 JWT。
   *    - `complete`：调用 `MfaService.revokeTicket(ticket)`（或先发 token 再撤销，按防重放策略二选一），再签发 JWT。
   *    - `failed` / `blocked`：必要时 `recordAudit`，返回错误码。
   * 3. 在关键节点调用 `MfaService.recordAudit`（亦可仅在 `MfaService` 内聚）。
   *
   * @param input MFA 验证入参对象
   * @param input.ticket 第一步 `login` 返回的 MFA 会话标识
   * @param input.type 本次提交的认证因子类型（TOTP、EMAIL 等）
   * @param input.code 用户输入的动态码
   * @param context 请求上下文，与 `MfaService.verifyFactor` 的 `context` 一致
   * @returns 进行中则带进度信息；完成则带 `accessToken`（及可选 `refreshToken`）
   */
  async authenticateMfa(
    input: { ticket: string, type: AuthenticatorType, code: string },
    context: AuthClientContext,
  ) {
    this.logger.debug({ msg: 'authenticateMfa', ticket: input.ticket, type: input.type, ip: context.ip })
    void await this.mfa.getTicket(input.ticket)
    void await this.mfa.verifyFactor({
      ticket: input.ticket,
      type: input.type,
      code: input.code,
      context,
    })
    // 占位：根据 verifyFactor 返回值分支，完成时 revokeTicket + JwtService.sign
    return { status: 'not_implemented' as const }
  }

  /**
   * 使用备份码完成或跳过部分 MFA 步骤（与 `AuthController` 的 `/authenticate/backup` 对齐）。
   *
   * **与 `MfaService` 的关系**
   * 校验备份码逻辑可在本类或独立 `BackupCodeService` 中实现；验证通过后仍需读写 Redis 中的 ticket 载荷，
   * 并可能调用 `MfaService.recordAudit`；若备份码等价于「整次 MFA 通过」，则与 `authenticateMfa` 完成态一致地签发 JWT。
   *
   * @param input 备份码验证入参对象
   * @param input.ticket 当前 MFA 会话
   * @param input.backupCode 用户提交的备份码
   * @param context 请求上下文
   */
  async authenticateMfaWithBackup(
    input: { ticket: string, backupCode: string },
    context: AuthClientContext,
  ) {
    this.logger.debug({
      msg: 'authenticateMfaWithBackup',
      ticket: input.ticket,
      backupCode: '[redacted]',
      ip: context.ip,
    })
    void input.backupCode
    return { status: 'not_implemented' as const }
  }

  /**
   * 使用 refresh_token 换发新的 access_token（与 `AuthController` 的 `/refresh` 对齐）。
   *
   * **与 `MfaService` 的关系**
   * 常规刷新**不**经过 MFA；若产品要求「刷新也需二次验证」，可在此分支调用 `isMfaRequiredForUser` 或独立策略。
   *
   * @param _refreshToken 客户端持有的 refresh token
   */
  async refreshSession(_refreshToken: string) {
    return { status: 'not_implemented' as const }
  }

  /**
   * 登出：吊销 refresh、清理服务端会话（与 `AuthController` 的 `/logout` 对齐）。
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
