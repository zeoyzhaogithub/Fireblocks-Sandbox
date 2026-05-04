import { Injectable } from "@nestjs/common";
import type { Prisma } from "@service/database";
import { PrismaService } from "../database/prisma.service";

function mapFlowStatusToTransactionStatus(
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED",
): "PENDING" | "POSTED" | "FAILED" | "REVERSED" {
  if (status === "COMPLETED") return "POSTED";
  if (status === "FAILED") return "FAILED";
  if (status === "CANCELLED") return "REVERSED";
  return "PENDING";
}

@Injectable()
export class TransactionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserIdByVaultAccountId(vaultAccountId: string): Promise<string | null> {
    const user = await this.prisma.user.findFirst({
      where: { vault_account_id: vaultAccountId },
      select: { id: true },
    });
    return user?.id ?? null;
  }

  async createWalletFlowRecord(input: {
    userId: string;
    flowType: "DEPOSIT" | "WITHDRAWAL";
    status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
    assetCode: string;
    network?: string;
    address: string;
    amount: string;
    feeAmount?: string;
    custodyTxId?: string;
    txHash?: string;
    failReason?: string;
  }): Promise<void> {
    const detail: Prisma.InputJsonValue = {
      userId: input.userId,
      assetCode: input.assetCode,
      network: input.network ?? null,
      address: input.address,
      custodyTxId: input.custodyTxId ?? null,
      failReason: input.failReason ?? null,
      flowStatus: input.status,
    };

    await this.prisma.transaction.create({
      data: {
        type: input.flowType,
        status: mapFlowStatusToTransactionStatus(input.status),
        hash: input.txHash ?? undefined,
        amount: input.amount,
        fee: input.feeAmount,
        detail,
      },
      select: { id: true },
    });
  }

  async createTransferFlowRecords(input: {
    sourceUserId: string;
    destinationUserId: string;
    status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
    assetCode: string;
    amount: string;
    sourceAddress: string;
    destinationAddress: string;
    txHash?: string;
    custodyTxId?: string;
  }): Promise<void> {
    const mapped = mapFlowStatusToTransactionStatus(input.status);

    await this.prisma.$transaction([
      this.prisma.transaction.create({
        data: {
          type: "WITHDRAWAL",
          status: mapped,
          hash: input.txHash ?? undefined,
          amount: input.amount,
          detail: {
            userId: input.sourceUserId,
            assetCode: input.assetCode,
            address: input.destinationAddress,
            custodyTxId: input.custodyTxId ?? null,
            counterpartyAddress: input.destinationAddress,
            flowStatus: input.status,
          } satisfies Prisma.InputJsonValue,
        },
        select: { id: true },
      }),
      this.prisma.transaction.create({
        data: {
          type: "DEPOSIT",
          status: mapped,
          amount: input.amount,
          detail: {
            userId: input.destinationUserId,
            assetCode: input.assetCode,
            address: input.sourceAddress,
            txHash: input.txHash ?? null,
            flowStatus: input.status,
          } satisfies Prisma.InputJsonValue,
        },
        select: { id: true },
      }),
    ]);
  }

  async saveQuerySnapshot(_payload: unknown): Promise<void> {
    // TODO: persist to database when DB layer is ready.
  }

  async saveListSnapshot(_payload: unknown): Promise<void> {
    // TODO: persist to database when DB layer is ready.
  }

  async saveCreateSnapshot(_payload: unknown): Promise<void> {
    // TODO: persist to database when DB layer is ready.
  }
}
