import { Body, Controller, Inject, Post } from "@nestjs/common";
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { LoginDto } from "./dto/login.dto";
import { AuthService } from "./auth.service";

@ApiTags("provider-auth")
@Controller("auth")
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @ApiOperation({
    summary: "邮箱登录并触发钱包编排",
    description: "登录成功后会更新用户信息，并执行 Fireblocks vault/address 的初始化与同步。",
  })
  @ApiBody({
    schema: {
      type: "object",
      required: ["email"],
      properties: {
        email: {
          type: "string",
          format: "email",
          description: "登录邮箱，必须是合法邮箱格式",
          example: "demo@example.com",
        },
      },
    },
  })
  @ApiOkResponse({
    description: "登录成功，返回用户信息与钱包同步结果。",
    schema: {
      type: "object",
      properties: {
        user: {
          type: "object",
          properties: {
            id: { type: "string", example: "clx1234567890abcdef" },
            email: { type: "string", example: "demo@example.com", nullable: true },
            emailVerifiedAt: { type: "string", format: "date-time", nullable: true },
            lastLoginAt: { type: "string", format: "date-time", nullable: true },
            loginCount: { type: "number", example: 1 },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        wallet: {
          type: "object",
          properties: {
            vaultAccountId: { type: "string", example: "123456789" },
            createdVault: { type: "boolean", example: true },
            syncedAddresses: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  assetLegacyId: { type: "string", example: "USDT_TRX" },
                  blockchainKey: { type: "string", example: "TRON" },
                  address: { type: "string", example: "TQ3s..." },
                  tag: { type: "string", nullable: true },
                },
              },
            },
            email: { type: "string", example: "demo@example.com" },
          },
        },
        message: { type: "string", example: "login success" },
      },
    },
  })
  @Post("login")
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }
}
