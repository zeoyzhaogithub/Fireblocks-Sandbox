import "reflect-metadata";
import { Controller, Get, Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

@Controller()
class ScheduleController {
  @Get("health")
  health() {
    return { service: "schedule", status: "ok" };
  }
}

@Module({
  controllers: [ScheduleController],
})
class ScheduleModule {}

async function bootstrap() {
  const app = await NestFactory.create(ScheduleModule);
  const port = Number(process.env.SCHEDULE_PORT ?? "5100");
  await app.listen(port);
  console.log(`[schedule] listening on http://localhost:${port}`);
}

void bootstrap();
