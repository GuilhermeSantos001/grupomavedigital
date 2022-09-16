import { CreateUser } from '@/users/usecases/create-users.usecase';
import { UserPrismaDB } from '@/users/db/users-prisma.db';
import { CreateUserDto } from '@/users/dto/create-users.dto';

import { PrismaService } from '@/core/prisma/prisma.service';
import { Locale } from '@/core/libs/i18n.lib';
import { JsonEx } from '@/core/libs/json-ex.lib';

export class CreateUserFactory {
  static async run(
    user: CreateUserDto,
    prismaService: PrismaService,
    locale: Locale,
    jsonEx: JsonEx,
  ) {
    return await CreateUser.execute(
      user,
      new UserPrismaDB(prismaService),
      locale,
      jsonEx,
    );
  }
}
