import { LogoutUser } from '@/users/usecases/logout-users.usecase';
import { UserPrismaDB } from '@/users/db/users-prisma.db';

import { PrismaService } from '@/core/prisma/prisma.service';
import { Locale } from '@/core/libs/i18n.lib';
import { JsonEx } from '@/core/libs/json-ex.lib';

export class LogoutUserFactory {
  static async run(
    id: string,
    token_value: string,
    prismaService: PrismaService,
    locale: Locale,
    jsonEx: JsonEx,
  ) {
    return await LogoutUser.execute(
      id,
      token_value,
      new UserPrismaDB(prismaService),
      locale,
      jsonEx,
    );
  }
}
