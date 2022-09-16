import { FindByIdUser } from '@/users/usecases/find-by-id-users.usecase';
import { UserPrismaDB } from '@/users/db/users-prisma.db';

import { PrismaService } from '@/core/prisma/prisma.service';
import { Locale } from '@/core/libs/i18n.lib';
import { JsonEx } from '@/core/libs/json-ex.lib';

export class FindByIdUserFactory {
  static async run(
    id: string,
    prismaService: PrismaService,
    locale: Locale,
    jsonEx: JsonEx,
  ) {
    return await FindByIdUser.execute(
      id,
      new UserPrismaDB(prismaService),
      locale,
      jsonEx,
    );
  }
}
