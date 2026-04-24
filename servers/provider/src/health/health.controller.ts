import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { getFireblocksClient } from "@service/fireblocks";

@ApiTags("health")
@Controller()
export class HealthController {
  @Get("health")
  @ApiOperation({ summary: "Provider health check" })
  health() {
    return { service: "provider", status: "ok" };
  }

  @Get("ready")
  @ApiOperation({ summary: "Fireblocks SDK readiness check" })
  fireblocksReady() {
    getFireblocksClient();
    return { service: "provider", fireblocks: "ready" };
  }
}
