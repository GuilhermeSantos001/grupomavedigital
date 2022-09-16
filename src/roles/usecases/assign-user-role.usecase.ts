import { RoleRepository } from '@/roles/repositories/roles.repository';
import { AssignUserRoleDto } from '@/roles/dto/assign-user-roles.dto';

import { RoleDatabaseContract } from '@/roles/contracts/roles-database.contract';
import { Locale } from '@/core/libs/i18n.lib';
import { JsonEx } from '@/core/libs/json-ex.lib';

export class AssignUserRole {
  static async execute(
    assign: AssignUserRoleDto,
    database: RoleDatabaseContract,
    locale: Locale,
    jsonEx: JsonEx,
  ) {
    const repository = new RoleRepository(database, locale, jsonEx);

    return await repository.assignUsers(assign.id, assign.userId);
  }
}
