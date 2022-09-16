import { RoleRepository } from '@/roles/repositories/roles.repository';
import { CreateRoleDto } from '@/roles/dto/create-roles.dto';

import { RoleDatabaseContract } from '@/roles/contracts/roles-database.contract';
import { Locale } from '@/core/libs/i18n.lib';
import { JsonEx } from '@/core/libs/json-ex.lib';

export class CreateRole {
  static async execute(
    role: CreateRoleDto,
    database: RoleDatabaseContract,
    locale: Locale,
    jsonEx: JsonEx,
  ) {
    const repository = new RoleRepository(database, locale, jsonEx);

    return await repository.register({
      ...role,
      id: database.generateID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
