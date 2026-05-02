import { Inject, Injectable } from "@nestjs/common";
import { UsersRepository } from "./users.repository";

@Injectable()
export class UsersService {
  constructor(@Inject(UsersRepository) private readonly usersRepository: UsersRepository) {}

  async loginByEmail(rawEmail: string) {
    const email = rawEmail.trim().toLowerCase();
    // create or update user data in the user table with email as the unique identifier
    return this.usersRepository.upsertUserByEmail(email);
  }
}
