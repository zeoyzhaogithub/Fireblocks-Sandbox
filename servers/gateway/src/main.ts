import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { RequestMethod } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix("api/v1", {
    exclude: [{ path: "health", method: RequestMethod.GET }],
  });

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
