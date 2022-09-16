import { UserRepository } from '@/users/repositories/users.repository';
import { CreateUserDto } from '@/users/dto/create-users.dto';

import { UserDatabaseContract } from '@/users/contracts/users-database.contract';
import { Locale } from '@/core/libs/i18n.lib';
import { JsonEx } from '@/core/libs/json-ex.lib';

export class CreateUser {
  static async execute(
    user: CreateUserDto,
    database: UserDatabaseContract,
    locale: Locale,
    jsonEx: JsonEx,
  ) {
    const repository = new UserRepository(database, locale, jsonEx);

    return await repository.register({
      ...user,
      id: database.generateID(),
      hash: {
        email: database.hashByText(user.email),
      },
      session: {},
      activate: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
