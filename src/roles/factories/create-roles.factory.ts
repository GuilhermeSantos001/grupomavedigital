import { CreateRole } from '@/roles/usecases/create-roles.usecase';
import { RolePrismaDB } from '@/roles/db/roles-prisma.db';
import { CreateRoleDto } from '@/roles/dto/create-roles.dto';

import { PrismaService } from '@/core/prisma/prisma.service';
import { Locale } from '@/core/libs/i18n.lib';
import { JsonEx } from '@/core/libs/json-ex.lib';

export class CreateRoleFactory {
  static async run(
    role: CreateRoleDto,
    prismaService: PrismaService,
    locale: Locale,
    jsonEx: JsonEx,
  ) {
    return await CreateRole.execute(
      role,
      new RolePrismaDB(prismaService),
      locale,
      jsonEx,
    );
  }
}
