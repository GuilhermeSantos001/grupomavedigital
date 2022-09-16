import { CoreDatabaseContract } from '@/core/contracts/core-database.contract';

import { Role } from '@prisma/client';
import { RoleEntity } from '@/roles/entities/roles.entity';

export abstract class RoleDatabaseContract extends CoreDatabaseContract<
  Role,
  RoleEntity
> {
  abstract findByName(name: string): Promise<RoleEntity | never>;
  abstract assignUser(roleId: string, userId: string): Promise<boolean>;
  abstract unassignUser(roleId: string, userId: string): Promise<boolean>;
}
