import { Controller, Inject, Post } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthService } from './auth.service'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthService) private readonly service: AuthService,
    @Inject(JwtService) private jwt: JwtService,
  ) {}

  @Post('/login')
  @ApiOperation({ summary: '基础登录', description: '校验账号密码，返回 MFA 认证状态。' })
  login() {
    // return this.mfa.createTicket()
  }

  @Post('/authenticate')
  @ApiOperation({ summary: 'MFA 验证', description: '查询记录进度，全部通过后发 JWT。' })
  authenticate() {

  }

  @Post('/authenticate/backup')
  @ApiOperation({ summary: '备份码登录', description: '验证 backup_codes 跳过对应的 MFA 类型。' })
  backupAuthenticate() {

  }

  @Post('/refresh')
  @ApiOperation({ summary: '刷新令牌', description: '使用 refresh_token 换取新的 access_token。' })
  refresh() {

  }

  @Post('/logout')
  @ApiOperation({ summary: '退出登录', description: '吊销 Token，清理 Redis 中的认证 Session。' })
  logout() {

  }
}
