import { Injectable } from "@nestjs/common";
import { UsersRepository } from "./users.repository";

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async loginByEmail(rawEmail: string) {
    const email = rawEmail.trim().toLowerCase();
    const user = await this.usersRepository.upsertUserByEmail(email);
    await this.usersRepository.upsertEmailAuthProvider(user.id, email);
    return user;
  }
}
