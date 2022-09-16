import { FindAllUsers } from '@/users/usecases/find-all-users.usecase';
import { UserPrismaDB } from '@/users/db/users-prisma.db';

import { PrismaService } from '@/core/prisma/prisma.service';
import { Locale } from '@/core/libs/i18n.lib';
import { JsonEx } from '@/core/libs/json-ex.lib';

export class FindAllUsersFactory {
  static async run(
    prismaService: PrismaService,
    locale: Locale,
    jsonEx: JsonEx,
  ) {
    return await FindAllUsers.execute(
      new UserPrismaDB(prismaService),
      locale,
      jsonEx,
    );
  }
}
