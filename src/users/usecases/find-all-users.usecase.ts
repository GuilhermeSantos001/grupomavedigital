import { UserRepository } from '@/users/repositories/users.repository';
import { UserDatabaseContract } from '@/users/contracts/users-database.contract';
import { Locale } from '@/core/libs/i18n.lib';
import { JsonEx } from '@/core/libs/json-ex.lib';

export class FindAllUsers {
  static async execute(
    database: UserDatabaseContract,
    locale: Locale,
    jsonEx: JsonEx,
  ) {
    const repository = new UserRepository(database, locale, jsonEx);

    return await repository.findMany();
  }
}
