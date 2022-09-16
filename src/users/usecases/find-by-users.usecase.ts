import { User } from '@prisma/client';

import { UserRepository } from '@/users/repositories/users.repository';
import { UserDatabaseContract } from '@/users/contracts/users-database.contract';
import { Locale } from '@/core/libs/i18n.lib';
import { JsonEx } from '@/core/libs/json-ex.lib';

import { RecursivePartial } from '@/core/common/types/recursive-partial.type';
import { SimilarityType } from '@/core/utils/similarity-filter.util';

export class FindByUser {
  static async execute(
    database: UserDatabaseContract,
    locale: Locale,
    jsonEx: JsonEx,
    filter: RecursivePartial<User>,
    similarity?: SimilarityType,
  ) {
    const repository = new UserRepository(database, locale, jsonEx);

    return await repository.findBy(filter, similarity);
  }
}
