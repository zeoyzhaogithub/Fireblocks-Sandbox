-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('BASIC', 'CERTIFIED');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('EMAIL', 'AUTH0', 'GOOGLE', 'CUSTOM');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "email_verified_at" TIMESTAMP(3),
    "username" TEXT,
    "display_name" TEXT,
    "avatar" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'BASIC',
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "last_login_at" TIMESTAMP(3),
    "last_login_area" TEXT,
    "login_count" INTEGER NOT NULL DEFAULT 0,
    "invite_code" TEXT,
    "invited_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_auth_providers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" "AuthProvider" NOT NULL DEFAULT 'EMAIL',
    "provider_subject" TEXT NOT NULL,
    "linked_accounts" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_auth_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "refresh_token" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "last_used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_fireblocks_vaults" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "vault_account_id" TEXT NOT NULL,
    "vault_name" TEXT,
    "customer_ref_id" TEXT,
    "hidden_on_ui" BOOLEAN NOT NULL DEFAULT true,
    "auto_fuel" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_fireblocks_vaults_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fireblocks_deposit_addresses" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "vault_account_id" TEXT NOT NULL,
    "fireblocks_asset_legacy_id" TEXT NOT NULL,
    "blockchain_key" TEXT,
    "address" TEXT NOT NULL,
    "tag" TEXT,
    "legacy_address" TEXT,
    "wallet_status" TEXT,
    "activation_tx_id" TEXT,
    "address_row_id" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fireblocks_deposit_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_invite_code_key" ON "users"("invite_code");

-- CreateIndex
CREATE INDEX "users_email_verified_at_idx" ON "users"("email_verified_at");

-- CreateIndex
CREATE INDEX "users_invited_by_id_idx" ON "users"("invited_by_id");

-- CreateIndex
CREATE INDEX "user_auth_providers_user_id_idx" ON "user_auth_providers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_auth_providers_provider_provider_subject_key" ON "user_auth_providers"("provider", "provider_subject");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_token_key" ON "user_sessions"("token");

-- CreateIndex
CREATE INDEX "user_sessions_user_id_idx" ON "user_sessions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_fireblocks_vaults_user_id_key" ON "user_fireblocks_vaults"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_fireblocks_vaults_vault_account_id_key" ON "user_fireblocks_vaults"("vault_account_id");

-- CreateIndex
CREATE INDEX "fireblocks_deposit_addresses_vault_account_id_idx" ON "fireblocks_deposit_addresses"("vault_account_id");

-- CreateIndex
CREATE INDEX "fireblocks_deposit_addresses_address_idx" ON "fireblocks_deposit_addresses"("address");

-- CreateIndex
CREATE UNIQUE INDEX "fireblocks_deposit_addresses_user_id_fireblocks_asset_legac_key" ON "fireblocks_deposit_addresses"("user_id", "fireblocks_asset_legacy_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_invited_by_id_fkey" FOREIGN KEY ("invited_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_auth_providers" ADD CONSTRAINT "user_auth_providers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_fireblocks_vaults" ADD CONSTRAINT "user_fireblocks_vaults_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fireblocks_deposit_addresses" ADD CONSTRAINT "fireblocks_deposit_addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
