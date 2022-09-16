import { UpdateRole } from '@/roles/usecases/update-roles.usecase';
import { RolePrismaDB } from '@/roles/db/roles-prisma.db';
import { UpdateRoleDto } from '@/roles/dto/update-roles.dto';

import { PrismaService } from '@/core/prisma/prisma.service';
import { Locale } from '@/core/libs/i18n.lib';
import { JsonEx } from '@/core/libs/json-ex.lib';

export class UpdateRoleFactory {
  static async run(
    id: string,
    newData: UpdateRoleDto,
    prismaService: PrismaService,
    locale: Locale,
    jsonEx: JsonEx,
  ) {
    return await UpdateRole.execute(
      id,
      newData,
      new RolePrismaDB(prismaService),
      locale,
      jsonEx,
    );
  }
}
