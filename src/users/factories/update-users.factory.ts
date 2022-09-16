import { UpdateUser } from '@/users/usecases/update-users.usecase';
import { UserPrismaDB } from '@/users/db/users-prisma.db';
import { UpdateUserDto } from '@/users/dto/update-users.dto';

import { PrismaService } from '@/core/prisma/prisma.service';
import { Locale } from '@/core/libs/i18n.lib';
import { JsonEx } from '@/core/libs/json-ex.lib';

export class UpdateUserFactory {
  static async run(
    id: string,
    newData: UpdateUserDto,
    prismaService: PrismaService,
    locale: Locale,
    jsonEx: JsonEx,
  ) {
    return await UpdateUser.execute(
      id,
      newData,
      new UserPrismaDB(prismaService),
      locale,
      jsonEx,
    );
  }
}
