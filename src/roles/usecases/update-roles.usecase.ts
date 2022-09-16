import { RoleRepository } from '@/roles/repositories/roles.repository';
import { RoleDatabaseContract } from '@/roles/contracts/roles-database.contract';
import { UpdateRoleDto } from '@/roles/dto/update-roles.dto';
import { Locale } from '@/core/libs/i18n.lib';
import { JsonEx } from '@/core/libs/json-ex.lib';

export class UpdateRole {
  static async execute(
    id: string,
    newData: UpdateRoleDto,
    database: RoleDatabaseContract,
    locale: Locale,
    jsonEx: JsonEx,
  ) {
    const repository = new RoleRepository(database, locale, jsonEx);

    return await repository.update(id, {
      ...newData,
      updatedAt: new Date(),
    });
  }
}
