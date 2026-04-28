import { Body, Controller, Post } from "@nestjs/common";
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import type { LoginDto } from "./dto/login.dto";
import type { LoginResponseDto } from "./dto/login.response.dto";

@ApiTags("gateway-auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: "Email login",
    description: "Accepts user email and proxies to provider login flow.",
  })
  @ApiBody({
    schema: {
      type: "object",
      required: ["email"],
      properties: {
        email: {
          type: "string",
          format: "email",
          example: "demo@example.com",
          description: "User email used for login",
        },
      },
    },
  })
  @ApiOkResponse({
    description: "Login success with persisted user profile.",
    schema: {
      type: "object",
      properties: {
        user: {
          type: "object",
          properties: {
            id: { type: "string", example: "clx1234567890abcdef" },
            email: { type: "string", example: "demo@example.com", nullable: true },
            emailVerifiedAt: { type: "string", format: "date-time", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            lastLoginAt: { type: "string", format: "date-time", nullable: true },
            loginCount: { type: "number", example: 1 },
          },
        },
        message: { type: "string", example: "login success" },
      },
    },
  })
  @Post("login")
  login(@Body() body: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(body);
  }
}
