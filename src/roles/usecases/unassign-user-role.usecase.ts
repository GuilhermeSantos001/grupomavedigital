import { RoleRepository } from '@/roles/repositories/roles.repository';
import { UnassignUserRoleDto } from '@/roles/dto/unassign-user-roles.dto';

import { RoleDatabaseContract } from '@/roles/contracts/roles-database.contract';
import { Locale } from '@/core/libs/i18n.lib';
import { JsonEx } from '@/core/libs/json-ex.lib';

export class UnassignUserRole {
  static async execute(
    unassign: UnassignUserRoleDto,
    database: RoleDatabaseContract,
    locale: Locale,
    jsonEx: JsonEx,
  ) {
    const repository = new RoleRepository(database, locale, jsonEx);

    return await repository.unassignUsers(unassign.id, unassign.userId);
  }
}
