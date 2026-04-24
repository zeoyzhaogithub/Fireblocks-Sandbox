import "reflect-metadata";
import { Controller, Get, Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

@Controller()
class GatewayController {
  @Get("health")
  health() {
    return { service: "gateway", status: "ok" };
  }
}

@Module({
  controllers: [GatewayController],
})
class GatewayModule {}

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);

  const swaggerEnabled = process.env.GATEWAY_SWAGGER_ENABLED !== "false";
  const swaggerPath = process.env.GATEWAY_SWAGGER_PATH ?? "docs";
  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("Fireblocks Gateway API")
      .setDescription("Gateway APIs for external access")
      .setVersion("1.0.0")
      .build();
    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(swaggerPath, app, swaggerDocument);
  }

  const port = Number(process.env.GATEWAY_PORT ?? "3100");
  await app.listen(port);
  console.log(`[gateway] listening on http://localhost:${port}`);
  if (swaggerEnabled) {
    console.log(`[gateway] swagger available at http://localhost:${port}/${swaggerPath}`);
  }
}

void bootstrap();
