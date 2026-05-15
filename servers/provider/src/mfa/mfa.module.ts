import { Module } from '@nestjs/common'
import { VerificationModule } from '../verification/verification.module'
import { MfaController } from './mfa.controller'
import { MfaService } from './mfa.service'

@Module({
  imports: [VerificationModule],
  controllers: [MfaController],
  providers: [MfaService],
  exports: [MfaService],
})
export class MfaModule {}
