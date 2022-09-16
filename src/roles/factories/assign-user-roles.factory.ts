import { AssignUserRole } from '@/roles/usecases/assign-user-role.usecase';
import { RolePrismaDB } from '@/roles/db/roles-prisma.db';
import { AssignUserRoleDto } from '@/roles/dto/assign-user-roles.dto';

import { PrismaService } from '@/core/prisma/prisma.service';
import { Locale } from '@/core/libs/i18n.lib';
import { JsonEx } from '@/core/libs/json-ex.lib';

export class AssignUserRoleFactory {
  static async run(
    assign: AssignUserRoleDto,
    prismaService: PrismaService,
    locale: Locale,
    jsonEx: JsonEx,
  ) {
    return await AssignUserRole.execute(
      assign,
      new RolePrismaDB(prismaService),
      locale,
      jsonEx,
    );
  }
}
