import { UserRepository } from '@/users/repositories/users.repository';
import { UserDatabaseContract } from '@/users/contracts/users-database.contract';
import { UpdateUserDto } from '@/users/dto/update-users.dto';
import { Locale } from '@/core/libs/i18n.lib';
import { JsonEx } from '@/core/libs/json-ex.lib';

export class UpdateUser {
  static async execute(
    id: string,
    newData: UpdateUserDto,
    database: UserDatabaseContract,
    locale: Locale,
    jsonEx: JsonEx,
  ) {
    const repository = new UserRepository(database, locale, jsonEx);

    return await repository.update(id, {
      ...newData,
      updatedAt: new Date(),
    });
  }
}
