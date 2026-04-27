# Fireblocks-Sandbox
Fireblocks Sandbox

```bash
pnpm init
mkdir -p servers/{gateway,provider,schedule}/src
mkdir -p service/{redis,database}/src
mkdir -p service/database/prisma/{user,post}
mkdir -p docker
```

### 安装根依赖

```bash
pnpm add @nestjs/common @nestjs/core @nestjs/platform-express @nestjs/microservices @nestjs/swagger nestjs-extras-w reflect-metadata rxjs
pnpm add -D typescript @types/node eslint vitest
```

### 6.4 初始化 Docker 依赖服务

```bash
cp .env.example .env
docker compose --env-file .env -f docker/docker-compose.service.yml up -d
```

后续只要每次改完 schema.prisma 后执行一次：
```bash
pnpm exec dotenv -e .env -- pnpm --filter @service/database exec prisma generate

dotenv -e .env -- pnpm --filter @service/database exec prisma migrate dev --name <你的变更名>
dotenv -e .env -- pnpm --filter @service/database exec prisma generate
```

就不会再出现这类“generated client 找不到”的问题


 校验 schema
dotenv -e .env -- pnpm --filter @service/database exec prisma validate


5) 初始化迁移并建表（关键）
dotenv -e .env -- pnpm --filter @service/database exec prisma migrate dev --name init

6) 生成 Prisma Client

dotenv -e .env -- pnpm --filter @service/database exec prisma generate

7) 验证结果（可选）
dotenv -e .env -- pnpm --filter @service/database exec prisma studio

pnpm exec dotenv -e .env -- pnpm --filter @service/database exec prisma migrate dev --name init

---
gateway

servers/gateway/src
├─ main.ts
├─ app.module.ts
├─ health/
│  └─ health.controller.ts
├─ common/
│  ├─ guards/
│  ├─ interceptors/
│  └─ filters/
├─ config/
│  └─ env.ts
├─ provider-client/
│  ├─ provider.client.ts
│  └─ provider.module.ts
└─ bff/
   ├─ assets/
   │  ├─ assets.controller.ts
   │  └─ assets.service.ts
   ├─ vaults/
   ├─ transactions/
   └─ deposit-assets/