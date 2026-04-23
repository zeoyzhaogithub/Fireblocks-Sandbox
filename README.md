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
docker network create internal
docker compose --env-file .env -f docker/docker-compose.service.yml up -d
```
