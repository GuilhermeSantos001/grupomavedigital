import { RemoveUser } from '@/users/usecases/remove-users.usecase';
import { UserPrismaDB } from '@/users/db/users-prisma.db';

import { PrismaService } from '@/core/prisma/prisma.service';
import { Locale } from '@/core/libs/i18n.lib';
import { JsonEx } from '@/core/libs/json-ex.lib';

export class RemoveUserFactory {
  static async run(
    id: string,
    prismaService: PrismaService,
    locale: Locale,
    jsonEx: JsonEx,
  ) {
    return await RemoveUser.execute(
      id,
      new UserPrismaDB(prismaService),
      locale,
      jsonEx,
    );
  }
}
