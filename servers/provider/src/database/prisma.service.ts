import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@service/database";
import pg from "pg";

const { Pool } = pg;

const createExtendedClient = (prismaClient: PrismaClient) =>
  prismaClient.$extends({
    model: {
      $allModels: {
        async exists<T>(this: T, where: Prisma.Args<T, "findFirst">["where"]): Promise<boolean> {
          const context = Prisma.getExtensionContext(this);
          const result = await (context as { findFirst: (args: { where: unknown }) => Promise<unknown> }).findFirst({
            where,
          });
          return result !== null;
        },
      },
    },
  });

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly pool: pg.Pool;
  private connected = false;
  private connectPromise: Promise<void> | null = null;
  private _custom: ReturnType<typeof createExtendedClient> | null = null;

  constructor() {
    const connectionString = process.env.DATABASE_URL?.trim();
    if (!connectionString) {
      throw new Error("DATABASE_URL is required for PrismaService");
    }
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    super({
      adapter,
      log: [
        { emit: "event", level: "query" },
        { emit: "stdout", level: "warn" },
        { emit: "stdout", level: "error" },
      ],
      errorFormat: "colorless",
    });
    this.pool = pool;
  }

  get custom() {
    if (!this._custom) {
      this._custom = createExtendedClient(this);
    }
    return this._custom;
  }

  private async ensureConnected(): Promise<void> {
    if (this.connected) {
      return;
    }
    if (this.connectPromise) {
      return this.connectPromise;
    }

    this.connectPromise = (async () => {
      this.logger.log("Connecting to database...");
      await this.$connect();
      this.connected = true;
      this.logger.log("Database connected");
      this.connectPromise = null;
    })();

    return this.connectPromise;
  }

  async onModuleInit(): Promise<void> {
    await this.ensureConnected();
    const enableQueryLog = process.env.PRISMA_LOG_QUERY === "true";
    (this as unknown as {
      $on: (eventType: "query", callback: (event: { query: string; params: string; duration: number }) => void) => void;
    }).$on("query", (event) => {
      if (!enableQueryLog) {
        return;
      }
      this.logger.verbose(
        `Prisma query:\n${event.query}\nparams: ${event.params}\nduration: ${event.duration}ms`,
      );
    });
  }

  async onModuleDestroy(): Promise<void> {
    if (this.connected) {
      await this.$disconnect();
      this.connected = false;
    }
    await this.pool.end();
  }
}
