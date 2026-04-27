import { Module } from "@nestjs/common";
import { ProviderClientModule } from "../../provider-client/provider.module";
import { TransactionsController } from "./transactions.controller";
import { TransactionsService } from "./transactions.service";

@Module({
  imports: [ProviderClientModule],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
