import { User } from '@prisma/client';
import { FindByUser } from '@/users/usecases/find-by-users.usecase';
import { UserPrismaDB } from '@/users/db/users-prisma.db';

import { PrismaService } from '@/core/prisma/prisma.service';
import { Locale } from '@/core/libs/i18n.lib';
import { JsonEx } from '@/core/libs/json-ex.lib';

import { RecursivePartial } from '@/core/common/types/recursive-partial.type';
import { SimilarityType } from '@/core/utils/similarity-filter.util';

export class FindByUserFactory {
  static async run(
    prismaService: PrismaService,
    locale: Locale,
    jsonEx: JsonEx,
    filter: RecursivePartial<User>,
    similarity?: SimilarityType,
  ) {
    return await FindByUser.execute(
      new UserPrismaDB(prismaService),
      locale,
      jsonEx,
      filter,
      similarity,
    );
  }
}
