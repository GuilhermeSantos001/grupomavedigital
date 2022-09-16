import { DecryptFieldValueUser } from '@/users/usecases/decrypt-field-value-users.usecase';
import { UserPrismaDB } from '@/users/db/users-prisma.db';

import { PrismaService } from '@/core/prisma/prisma.service';
import { Locale } from '@/core/libs/i18n.lib';
import { JsonEx } from '@/core/libs/json-ex.lib';

export class DecryptFieldValueUserFactory {
  static async run(
    value: string,
    prismaService: PrismaService,
    locale: Locale,
    jsonEx: JsonEx,
  ) {
    return await DecryptFieldValueUser.execute(
      value,
      new UserPrismaDB(prismaService),
      locale,
      jsonEx,
    );
  }
}
