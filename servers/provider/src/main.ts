import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const swaggerEnabled = process.env.PROVIDER_SWAGGER_ENABLED !== "false";
  const swaggerPath = process.env.PROVIDER_SWAGGER_PATH ?? "docs";
  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("Fireblocks Provider API")
      .setDescription("Provider APIs for Fireblocks capability verification")
      .setVersion("1.0.0")
      .build();
    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(swaggerPath, app, swaggerDocument);
  }

  const port = Number(process.env.PROVIDER_PORT ?? "4100");
  await app.listen(port);
  console.log(`[provider] listening on http://localhost:${port}`);
  if (swaggerEnabled) {
    console.log(`[provider] swagger available at http://localhost:${port}/${swaggerPath}`);
  }
}

void bootstrap();
