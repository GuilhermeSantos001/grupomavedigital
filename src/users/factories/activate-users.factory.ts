import { ActivateUser } from '@/users/usecases/activate-users.usecase';
import { UserPrismaDB } from '@/users/db/users-prisma.db';

import { PrismaService } from '@/core/prisma/prisma.service';
import { Locale } from '@/core/libs/i18n.lib';
import { JsonEx } from '@/core/libs/json-ex.lib';

export class ActivateUserFactory {
  static async run(
    id: string,
    prismaService: PrismaService,
    locale: Locale,
    jsonEx: JsonEx,
  ) {
    return await ActivateUser.execute(
      id,
      new UserPrismaDB(prismaService),
      locale,
      jsonEx,
    );
  }
}
