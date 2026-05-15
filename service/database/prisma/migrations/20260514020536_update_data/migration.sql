/*
  Warnings:

  - The values [SWEEP_TO_MASTER,CARD_APPLICATION_FEE] on the enum `TransactionType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `locked_until` on the `authenticators` table. All the data in the column will be lost.
  - You are about to drop the column `transaction_Hash` on the `kyt_alerts` table. All the data in the column will be lost.
  - You are about to drop the column `invite_code` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `vault_account_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `Asset` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Card` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DeliveryAddress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ResidentAddress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Transaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VaultAsset` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `card_wallet_top_ups` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `transaction_hash` to the `kyt_alerts` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MfaStatus" AS ENUM ('SUCCESS', 'EXPIRED');

-- AlterEnum
-- 注意：init 迁移里表名为 "Transaction"，此处不能写成 "transactions"（否则会 relation does not exist，整段事务中止）。
CREATE TYPE "TransactionType_new" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'CARD_DEPOSIT', 'CARD_FEE');
ALTER TABLE "Transaction" ALTER COLUMN "type" TYPE "TransactionType_new" USING ("type"::text::"TransactionType_new");
ALTER TYPE "TransactionType" RENAME TO "TransactionType_old";
ALTER TYPE "TransactionType_new" RENAME TO "TransactionType";
DROP TYPE "public"."TransactionType_old";

-- DropForeignKey
ALTER TABLE "Asset" DROP CONSTRAINT "Asset_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Card" DROP CONSTRAINT "Card_user_id_fkey";

-- DropForeignKey
ALTER TABLE "DeliveryAddress" DROP CONSTRAINT "DeliveryAddress_card_id_fkey";

-- DropForeignKey
ALTER TABLE "ResidentAddress" DROP CONSTRAINT "ResidentAddress_card_id_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_card_id_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_user_id_fkey";

-- DropForeignKey
ALTER TABLE "VaultAsset" DROP CONSTRAINT "VaultAsset_user_id_fkey";

-- DropForeignKey
ALTER TABLE "card_wallet_top_ups" DROP CONSTRAINT "card_wallet_top_ups_card_id_fkey";

-- DropForeignKey
ALTER TABLE "card_wallet_top_ups" DROP CONSTRAINT "card_wallet_top_ups_user_id_fkey";

-- DropForeignKey
ALTER TABLE "card_wallet_top_ups" DROP CONSTRAINT "card_wallet_top_ups_wallet_ledger_transaction_id_fkey";

-- DropForeignKey
ALTER TABLE "kyt_alerts" DROP CONSTRAINT "kyt_alerts_user_id_fkey";

-- DropIndex
DROP INDEX "kyt_alerts_transaction_Hash_idx";

-- DropIndex
DROP INDEX "users_invite_code_key";

-- AlterTable
ALTER TABLE "authenticators" DROP COLUMN "locked_until",
ADD COLUMN     "lockedUntil" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "kyt_alerts" DROP COLUMN "transaction_Hash",
ADD COLUMN     "transaction_hash" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "invite_code",
DROP COLUMN "vault_account_id",
ADD COLUMN     "joined_code" TEXT,
ADD COLUMN     "pin" TEXT,
ADD COLUMN     "referralCode" TEXT;

-- DropTable
DROP TABLE "Asset";

-- DropTable
DROP TABLE "Card";

-- DropTable
DROP TABLE "DeliveryAddress";

-- DropTable
DROP TABLE "ResidentAddress";

-- DropTable
DROP TABLE "Transaction";

-- DropTable
DROP TABLE "VaultAsset";

-- DropTable
DROP TABLE "card_wallet_top_ups";

-- DropEnum
DROP TYPE "CardWalletTopUpStatus";

-- CreateTable
CREATE TABLE "vault_assets" (
    "id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vault_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "balance" DECIMAL(36,18) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mfa_audit_logs" (
    "id" BIGSERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "MfaStatus" NOT NULL DEFAULT 'EXPIRED',
    "action" TEXT NOT NULL,
    "method" "AuthenticatorType"[],
    "ip" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mfa_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cards" (
    "id" TEXT NOT NULL,
    "type" "CardType" NOT NULL,
    "status" "CardStatus" NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "phone_code" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "consume_fee" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resident_addresses" (
    "id" TEXT NOT NULL,
    "card_id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "detail" TEXT NOT NULL,

    CONSTRAINT "resident_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_addresses" (
    "id" TEXT NOT NULL,
    "card_id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "detail" TEXT NOT NULL,

    CONSTRAINT "delivery_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rule" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "referral_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "hash" TEXT,
    "amount" DECIMAL(36,18) NOT NULL,
    "fee" DECIMAL(36,18),
    "detail" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "vault_account_id" TEXT NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "vault_assets_wallet_id_idx" ON "vault_assets"("wallet_id");

-- CreateIndex
CREATE INDEX "vault_assets_asset_id_idx" ON "vault_assets"("asset_id");

-- CreateIndex
CREATE INDEX "vault_assets_address_idx" ON "vault_assets"("address");

-- CreateIndex
CREATE INDEX "vault_assets_network_asset_id_idx" ON "vault_assets"("network", "asset_id");

-- CreateIndex
CREATE INDEX "assets_symbol_idx" ON "assets"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "assets_wallet_id_symbol_key" ON "assets"("wallet_id", "symbol");

-- CreateIndex
CREATE INDEX "mfa_audit_logs_user_id_created_at_idx" ON "mfa_audit_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "cards_type_idx" ON "cards"("type");

-- CreateIndex
CREATE INDEX "cards_status_idx" ON "cards"("status");

-- CreateIndex
CREATE INDEX "cards_email_idx" ON "cards"("email");

-- CreateIndex
CREATE INDEX "cards_created_at_idx" ON "cards"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "resident_addresses_card_id_key" ON "resident_addresses"("card_id");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_addresses_card_id_key" ON "delivery_addresses"("card_id");

-- CreateIndex
CREATE UNIQUE INDEX "referral_codes_code_key" ON "referral_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_hash_key" ON "transactions"("hash");

-- CreateIndex
CREATE INDEX "transactions_status_idx" ON "transactions"("status");

-- CreateIndex
CREATE INDEX "transactions_type_idx" ON "transactions"("type");

-- CreateIndex
CREATE INDEX "transactions_created_at_idx" ON "transactions"("created_at");

-- CreateIndex
CREATE INDEX "transactions_type_status_idx" ON "transactions"("type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_user_id_key" ON "wallets"("user_id");

-- CreateIndex
CREATE INDEX "wallets_user_id_idx" ON "wallets"("user_id");

-- CreateIndex
CREATE INDEX "wallets_vault_account_id_idx" ON "wallets"("vault_account_id");

-- CreateIndex
CREATE INDEX "authenticators_type_idx" ON "authenticators"("type");

-- CreateIndex
CREATE INDEX "authenticators_identifier_idx" ON "authenticators"("identifier");

-- CreateIndex
CREATE INDEX "kyt_alerts_transaction_hash_idx" ON "kyt_alerts"("transaction_hash");

-- CreateIndex
CREATE INDEX "kyt_alerts_alert_identifier_idx" ON "kyt_alerts"("alert_identifier");

-- CreateIndex
CREATE INDEX "kyt_alerts_asset_idx" ON "kyt_alerts"("asset");

-- CreateIndex
CREATE INDEX "kyt_alerts_created_at_idx" ON "kyt_alerts"("created_at");

-- CreateIndex
CREATE INDEX "users_status_joined_code_idx" ON "users"("status", "joined_code");

-- CreateIndex
CREATE INDEX "users_joined_code_inviter_id_idx" ON "users"("joined_code", "inviter_id");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_referralCode_idx" ON "users"("referralCode");

-- CreateIndex
CREATE INDEX "users_inviter_id_idx" ON "users"("inviter_id");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- AddForeignKey
ALTER TABLE "vault_assets" ADD CONSTRAINT "vault_assets_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mfa_audit_logs" ADD CONSTRAINT "mfa_audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resident_addresses" ADD CONSTRAINT "resident_addresses_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_addresses" ADD CONSTRAINT "delivery_addresses_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_codes" ADD CONSTRAINT "referral_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
