import { UnassignUserRole } from '@/roles/usecases/unassign-user-role.usecase';
import { RolePrismaDB } from '@/roles/db/roles-prisma.db';
import { UnassignUserRoleDto } from '@/roles/dto/unassign-user-roles.dto';

import { PrismaService } from '@/core/prisma/prisma.service';
import { Locale } from '@/core/libs/i18n.lib';
import { JsonEx } from '@/core/libs/json-ex.lib';

export class UnassignUserRoleFactory {
  static async run(
    unassign: UnassignUserRoleDto,
    prismaService: PrismaService,
    locale: Locale,
    jsonEx: JsonEx,
  ) {
    return await UnassignUserRole.execute(
      unassign,
      new RolePrismaDB(prismaService),
      locale,
      jsonEx,
    );
  }
}
