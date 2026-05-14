import { Module } from '@nestjs/common'
import { MfaModule } from '../mfa'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

@Module({
  imports: [MfaModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
