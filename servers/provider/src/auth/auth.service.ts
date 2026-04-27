import { BadRequestException, Injectable } from "@nestjs/common";
import type { LoginDto } from "./dto/login.dto";
import { UsersService } from "../users/users.service";

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async login(input: LoginDto) {
    const email = input.email?.trim();
    if (!email) {
      throw new BadRequestException("email is required");
    }
    const user = await this.usersService.loginByEmail(email);
    return {
      user,
      message: "login success",
    };
  }
}
