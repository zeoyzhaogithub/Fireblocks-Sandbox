import { prisma } from '@service/database'
import { AuthenticatorType, MfaStatus } from '@service/database/prisma'
import { redis } from '@service/redis'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MfaController } from './mfa.controller'
import { MfaService } from './mfa.service'

vi.mock('@service/database', () => ({
  prisma: {
    authenticator: { findMany: vi.fn() },
    mfa: { create: vi.fn() },
  },
}))

vi.mock('@service/redis', () => ({
  redis: {
    get: vi.fn(),
    del: vi.fn(),
  },
}))

describe('mfa 模块', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })
  // --- 可复用用例函数（供下方 it 与「手动入口」调用；不想跑的手动 await 注释掉即可）---

  async function case_service_resolveRequiredSteps(service: MfaService) {
    vi.mocked(prisma.authenticator.findMany).mockResolvedValue([
      { type: AuthenticatorType.TOTP, userId: 'u1', enabled: true },
      { type: AuthenticatorType.EMAIL, userId: 'u1', enabled: true },
    ] as never)

    const steps = await service.resolveRequiredSteps('u1')

    expect(prisma.authenticator.findMany).toHaveBeenCalledWith({
      where: { userId: 'u1', enabled: true },
    })
    expect(steps).toEqual([AuthenticatorType.TOTP, AuthenticatorType.EMAIL])
  }

  async function case_service_createTicket(service: MfaService) {
    const ticket = await service.createTicket({
      userId: 'u1',
      action: 'LOGIN',
      context: { ip: '127.0.0.1' },
    })
    // eslint-disable-next-line no-console
    console.log('[mfa.spec createTicket]', JSON.stringify({ ticket }))
    expect(ticket).toBe('')
  }

  async function case_service_getTicket(service: MfaService) {
    vi.mocked(redis.get).mockResolvedValue('{"ok":true}')

    const raw = await service.getTicket('abc')
    // eslint-disable-next-line no-console
    console.log('[mfa.spec getTicket]', JSON.stringify({ raw }))

    expect(redis.get).toHaveBeenCalledWith('mfa:ticket:abc')
    expect(raw).toBe('{"ok":true}')
  }

  async function case_service_isMfaRequired_empty(service: MfaService) {
    vi.mocked(prisma.authenticator.findMany).mockResolvedValue([])

    await expect(service.isMfaRequiredForUser('u1')).resolves.toBe(false)
  }

  async function case_service_isMfaRequired_withFactors(service: MfaService) {
    vi.mocked(prisma.authenticator.findMany).mockResolvedValue([{ type: AuthenticatorType.TOTP }] as never)

    await expect(service.isMfaRequiredForUser('u1')).resolves.toBe(true)
  }

  async function case_service_revokeTicket(service: MfaService) {
    vi.mocked(redis.del).mockResolvedValue(1)

    await service.revokeTicket('t1', 'logout')

    expect(redis.del).toHaveBeenCalledWith('mfa:ticket:t1')
  }

  async function case_service_recordAudit(service: MfaService) {
    vi.mocked(prisma.mfa.create).mockResolvedValue({} as never)

    const result = await service.recordAudit({
      userId: 'u1',
      status: MfaStatus.SUCCESS,
      action: 'LOGIN',
      method: AuthenticatorType.TOTP,
      context: { ip: '10.0.0.1' },
    })
    // eslint-disable-next-line no-console
    console.log('[mfa.spec recordAudit]', JSON.stringify({ result }))

    expect(prisma.mfa.create).toHaveBeenCalledWith({
      data: {
        userId: 'u1',
        status: MfaStatus.SUCCESS,
        action: 'LOGIN',
        resourceId: undefined,
        method: AuthenticatorType.TOTP,
        ip: '10.0.0.1',
        failReason: undefined,
      },
    })
  }

  async function case_controller_create_mapsBody() {
    const createTicket = vi.fn().mockResolvedValue('ticket-1')
    const verifyFactor = vi.fn()
    const controller = new MfaController({
      createTicket,
      verifyFactor,
    } as unknown as MfaService)

    const out = await controller.create({
      userId: 'u1',
      action: 'LOGIN',
      resourceId: 'res-1',
      ip: '192.168.1.1',
    })
    // eslint-disable-next-line no-console
    console.log('[mfa.spec controller.create]', JSON.stringify({ out }))

    expect(createTicket).toHaveBeenCalledWith({
      userId: 'u1',
      action: 'LOGIN',
      resourceId: 'res-1',
      context: { ip: '192.168.1.1' },
    })
  }

  async function case_controller_create_noIpNoContext() {
    const createTicket = vi.fn().mockResolvedValue('')
    const controller = new MfaController({
      createTicket,
      verifyFactor: vi.fn(),
    } as unknown as MfaService)

    await controller.create({ userId: 'u1', action: 'LOGIN' })

    expect(createTicket).toHaveBeenCalledWith({
      userId: 'u1',
      action: 'LOGIN',
      resourceId: undefined,
      context: undefined,
    })
  }

  async function case_controller_verify() {
    const createTicket = vi.fn()
    const verifyFactor = vi.fn().mockResolvedValue({ status: 'not_implemented' })
    const controller = new MfaController({
      createTicket,
      verifyFactor,
    } as unknown as MfaService)

    const out = await controller.verify({
      ticket: 'tk',
      type: AuthenticatorType.EMAIL,
      code: '123456',
      ip: '1.1.1.1',
    })
    // eslint-disable-next-line no-console
    console.log('[mfa.spec controller.verify]', JSON.stringify({ out }))

    expect(verifyFactor).toHaveBeenCalledWith({
      ticket: 'tk',
      type: AuthenticatorType.EMAIL,
      code: '123456',
      context: { ip: '1.1.1.1' },
    })
  }

  describe('mfaService', () => {
    let service: MfaService

    beforeEach(() => {
      service = new MfaService()
    })

    it('resolveRequiredSteps：返回已启用认证器的 type 列表', () => case_service_resolveRequiredSteps(service))

    it('isMfaRequiredForUser：无因子时为 false', () => case_service_isMfaRequired_empty(service))

    it('isMfaRequiredForUser：有因子时为 true', () => case_service_isMfaRequired_withFactors(service))

    it('createTicket：当前占位实现返回空字符串（开发时可看控制台输出）', () => case_service_createTicket(service))

    it('getTicket：使用 Redis key mfa:ticket:{ticket}', () => case_service_getTicket(service))

    it('revokeTicket：调用 redis.del', () => case_service_revokeTicket(service))

    it('recordAudit：写入 prisma.mfa.create', () => case_service_recordAudit(service))
  })

  describe('mfaController', () => {
    it('create：映射 body 并调用 MfaService.createTicket', case_controller_create_mapsBody)

    it('create：无 ip 时不传 context', case_controller_create_noIpNoContext)

    it('verify：转发到 MfaService.verifyFactor', case_controller_verify)
  })

  /**
   * 手动运行入口：把 `describe.skip` 改成 `describe`（或去掉 `.skip`），再注释掉不需要的 `await`。
   * 每步之间 `clearAllMocks`，避免与拆开的 it 行为差太多。
   * 本地调试用；提交前请保持 `.skip`，以免 CI 跑两套逻辑。
   */
  describe.skip('【手动入口】挑选 case_* 执行', () => {
    it('按序调用（注释掉不跑的）', async () => {
      const service = new MfaService()

      await case_service_createTicket(service)
      vi.clearAllMocks()

      await case_service_getTicket(service)
      vi.clearAllMocks()

      await case_service_resolveRequiredSteps(service)
      vi.clearAllMocks()
      await case_service_isMfaRequired_empty(service)
      vi.clearAllMocks()
      await case_service_isMfaRequired_withFactors(service)
      vi.clearAllMocks()

      await case_service_revokeTicket(service)
      vi.clearAllMocks()
      await case_service_recordAudit(service)
      vi.clearAllMocks()

      await case_controller_create_mapsBody()
      vi.clearAllMocks()
      await case_controller_create_noIpNoContext()
      vi.clearAllMocks()
      await case_controller_verify()
    })
  })
})

// pnpm exec vitest run servers/main/src/modules/mfa/mfa.spec.ts
