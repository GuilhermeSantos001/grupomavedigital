import { UserRepository } from '@/users/repositories/users.repository';

import { UserDatabaseContract } from '@/users/contracts/users-database.contract';
import { Locale } from '@/core/libs/i18n.lib';
import { JsonEx } from '@/core/libs/json-ex.lib';

import * as _ from 'lodash';

export class ActivateUser {
  static async execute(
    id: string,
    database: UserDatabaseContract,
    locale: Locale,
    jsonEx: JsonEx,
  ) {
    const repository = new UserRepository(database, locale, jsonEx),
      user = await repository.findById(id);

    if (user instanceof Error)
      return new Error(
        locale.translate(
          'customers.repository.customer_not_exists',
          'id',
          id,
        ) as string,
      );

    if (user.activate) return user;

    return await repository.update(id, {
      ..._.omit(user, ['roles']),
      activate: true,
      updatedAt: new Date(),
    });
  }
}
