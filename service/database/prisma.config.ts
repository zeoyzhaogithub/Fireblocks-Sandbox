import { config as loadDotenv } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, env } from "prisma/config";

// 在 service/database 下直接跑 prisma 时，默认不会加载仓库根目录的 .env；先补齐 DATABASE_URL 等变量。
const databasePackageDir = dirname(fileURLToPath(import.meta.url));
const repoRootDir = resolve(databasePackageDir, "../..");
loadDotenv({ path: resolve(repoRootDir, ".env") });
loadDotenv({ path: resolve(databasePackageDir, ".env") });

export default defineConfig({
  schema: "./prisma/schema",
  // Prisma 7：未配置时默认 none，会导致 migrate 报 migration persistence is not initialized
  migrations: {
    path: "./prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
