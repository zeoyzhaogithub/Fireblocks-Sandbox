-- CreateEnum
CREATE TYPE "AuthenticatorType" AS ENUM ('TOTP', 'TELEGRAM_OTP', 'EMAIL');

-- CreateEnum
CREATE TYPE "CardWalletTopUpStatus" AS ENUM ('PENDING', 'POSTED', 'FAILED', 'REVERSED');

-- CreateEnum
CREATE TYPE "CardType" AS ENUM ('ENTITY', 'VIRTUAL');

-- CreateEnum
CREATE TYPE "CardStatus" AS ENUM ('INITIAL', 'PAID', 'APPLYING', 'INACTIVE', 'ACTIVE', 'FREEZE');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('INITIAL', 'PENDING', 'REJECTED', 'COMPLETED', 'RETRY');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'SWEEP_TO_MASTER', 'CARD_APPLICATION_FEE', 'CARD_DEPOSIT', 'CARD_FEE');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'POSTED', 'FAILED', 'REVERSED');

-- CreateEnum
CREATE TYPE "FireblocksTxDirection" AS ENUM ('INBOUND', 'OUTBOUND', 'BETWEEN_VAULTS', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateTable
CREATE TABLE "VaultAsset" (
    "id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VaultAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "balance" DECIMAL(36,18) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "authenticators" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "AuthenticatorType" NOT NULL,
    "secret" TEXT,
    "identifier" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "failed_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP(3),
    "backup_codes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "authenticators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "CardType" NOT NULL,
    "status" "CardStatus" NOT NULL,
    "fiat_currency" TEXT NOT NULL DEFAULT 'USD',
    "fiat_balance" DECIMAL(36,18) NOT NULL DEFAULT 0,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "phone_code" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "consume_fee" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_wallet_top_ups" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "card_id" TEXT NOT NULL,
    "crypto_symbol" TEXT NOT NULL,
    "crypto_amount" DECIMAL(36,18) NOT NULL,
    "fiat_currency" TEXT NOT NULL,
    "fiat_amount" DECIMAL(36,18) NOT NULL,
    "fx_rate_fiat_per_crypto" DECIMAL(36,18) NOT NULL,
    "rate_source" TEXT,
    "rate_quote_id" TEXT,
    "quoted_at" TIMESTAMP(3),
    "status" "CardWalletTopUpStatus" NOT NULL DEFAULT 'PENDING',
    "idempotency_key" TEXT,
    "wallet_ledger_transaction_id" TEXT,
    "detail" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "card_wallet_top_ups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResidentAddress" (
    "id" TEXT NOT NULL,
    "card_id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "detail" TEXT NOT NULL,

    CONSTRAINT "ResidentAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryAddress" (
    "id" TEXT NOT NULL,
    "card_id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "detail" TEXT NOT NULL,

    CONSTRAINT "DeliveryAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kyc" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT,
    "external_user_id" TEXT NOT NULL,
    "applicant_id" TEXT NOT NULL,
    "status" "KycStatus" NOT NULL DEFAULT 'INITIAL',
    "level_name" TEXT,
    "review_status" TEXT,
    "review_result" TEXT,
    "sandbox_mode" BOOLEAN,
    "event_update_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kyc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kyt_alerts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "alert_identifier" TEXT NOT NULL,
    "alert_created_at" TIMESTAMP(3) NOT NULL,
    "transaction_Hash" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "raw" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kyt_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "hash" TEXT,
    "amount" DECIMAL(36,18) NOT NULL,
    "fee" DECIMAL(36,18),
    "detail" JSONB,
    "user_id" TEXT,
    "card_id" TEXT,
    "custody_tx_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_treasury" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "master_vault_account_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_treasury_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fireblocks_transaction_snapshots" (
    "id" TEXT NOT NULL,
    "custody_tx_id" TEXT NOT NULL,
    "vault_account_id" TEXT NOT NULL,
    "user_id" TEXT,
    "asset_id" TEXT,
    "amount" DECIMAL(36,18) NOT NULL,
    "fee" DECIMAL(36,18),
    "direction" "FireblocksTxDirection" NOT NULL DEFAULT 'UNKNOWN',
    "status" TEXT,
    "sub_status" TEXT,
    "occurred_at" TIMESTAMP(3),
    "raw" JSONB NOT NULL,
    "synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fireblocks_transaction_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "nickname" TEXT,
    "avatar" TEXT,
    "password" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "invite_code" TEXT,
    "inviter_id" TEXT,
    "vault_account_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VaultAsset_user_id_idx" ON "VaultAsset"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_user_id_symbol_key" ON "Asset"("user_id", "symbol");

-- CreateIndex
CREATE INDEX "authenticators_user_id_idx" ON "authenticators"("user_id");

-- CreateIndex
CREATE INDEX "authenticators_user_id_type_idx" ON "authenticators"("user_id", "type");

-- CreateIndex
CREATE INDEX "Card_user_id_idx" ON "Card"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "card_wallet_top_ups_idempotency_key_key" ON "card_wallet_top_ups"("idempotency_key");

-- CreateIndex
CREATE UNIQUE INDEX "card_wallet_top_ups_wallet_ledger_transaction_id_key" ON "card_wallet_top_ups"("wallet_ledger_transaction_id");

-- CreateIndex
CREATE INDEX "card_wallet_top_ups_user_id_idx" ON "card_wallet_top_ups"("user_id");

-- CreateIndex
CREATE INDEX "card_wallet_top_ups_card_id_idx" ON "card_wallet_top_ups"("card_id");

-- CreateIndex
CREATE INDEX "card_wallet_top_ups_status_idx" ON "card_wallet_top_ups"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ResidentAddress_card_id_key" ON "ResidentAddress"("card_id");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryAddress_card_id_key" ON "DeliveryAddress"("card_id");

-- CreateIndex
CREATE UNIQUE INDEX "Kyc_user_id_key" ON "Kyc"("user_id");

-- CreateIndex
CREATE INDEX "kyt_alerts_user_id_idx" ON "kyt_alerts"("user_id");

-- CreateIndex
CREATE INDEX "kyt_alerts_transaction_Hash_idx" ON "kyt_alerts"("transaction_Hash");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_hash_key" ON "Transaction"("hash");

-- CreateIndex
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");

-- CreateIndex
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");

-- CreateIndex
CREATE INDEX "Transaction_user_id_idx" ON "Transaction"("user_id");

-- CreateIndex
CREATE INDEX "Transaction_card_id_idx" ON "Transaction"("card_id");

-- CreateIndex
CREATE INDEX "Transaction_custody_tx_id_idx" ON "Transaction"("custody_tx_id");

-- CreateIndex
CREATE UNIQUE INDEX "fireblocks_transaction_snapshots_custody_tx_id_key" ON "fireblocks_transaction_snapshots"("custody_tx_id");

-- CreateIndex
CREATE INDEX "fireblocks_transaction_snapshots_vault_account_id_idx" ON "fireblocks_transaction_snapshots"("vault_account_id");

-- CreateIndex
CREATE INDEX "fireblocks_transaction_snapshots_user_id_idx" ON "fireblocks_transaction_snapshots"("user_id");

-- CreateIndex
CREATE INDEX "fireblocks_transaction_snapshots_occurred_at_idx" ON "fireblocks_transaction_snapshots"("occurred_at");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_invite_code_key" ON "users"("invite_code");

-- AddForeignKey
ALTER TABLE "VaultAsset" ADD CONSTRAINT "VaultAsset_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "authenticators" ADD CONSTRAINT "authenticators_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_wallet_top_ups" ADD CONSTRAINT "card_wallet_top_ups_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_wallet_top_ups" ADD CONSTRAINT "card_wallet_top_ups_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_wallet_top_ups" ADD CONSTRAINT "card_wallet_top_ups_wallet_ledger_transaction_id_fkey" FOREIGN KEY ("wallet_ledger_transaction_id") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResidentAddress" ADD CONSTRAINT "ResidentAddress_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryAddress" ADD CONSTRAINT "DeliveryAddress_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kyc" ADD CONSTRAINT "Kyc_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyt_alerts" ADD CONSTRAINT "kyt_alerts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "Card"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fireblocks_transaction_snapshots" ADD CONSTRAINT "fireblocks_transaction_snapshots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_inviter_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
