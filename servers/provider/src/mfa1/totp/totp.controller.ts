import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("totp")
@Controller("totp")
export class TotpController {}
