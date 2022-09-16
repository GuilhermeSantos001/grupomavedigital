import { RepositoryContract } from '@/core/contracts/repository.contract';
import { RoleDatabaseContract } from '@/roles/contracts/roles-database.contract';

import { Role } from '@prisma/client';
import { RoleEntity } from '@/roles/entities/roles.entity';

import * as _ from 'lodash';

export class RoleRepository extends RepositoryContract<
  Role,
  RoleEntity,
  RoleDatabaseContract
> {
  // ? This entity has no fields to be encrypted or transformed
  public async beforeSave(model: Role): Promise<Role> {
    return model;
  }

  // ? This entity has no fields to be encrypted or transformed
  public async beforeUpdate(
    beforeData: Role,
    nextData: Partial<Role>,
  ): Promise<Role> {
    return { ...beforeData, ...nextData };
  }

  public async decryptFieldValue(value: string): Promise<string> {
    return this.database.decrypt(value);
  }

  public async register(model: Role): Promise<RoleEntity | Error> {
    if (await this.database.findByName(model.name)) {
      return new Error('Role already exists');
    }

    return await this.database.create(await this.beforeSave(model));
  }

  public async findMany(): Promise<RoleEntity[]> {
    return await this.database.findAll();
  }

  public async findById(id: string): Promise<RoleEntity | Error> {
    const role = await this.database.findOne(id);

    if (!role) return new Error('Role not found');

    return role;
  }

  public async update(
    id: string,
    newData: Partial<RoleEntity>,
  ): Promise<RoleEntity | Error> {
    const role = await this.database.findOne(id);

    if (!role) return new Error('Role not found');

    return await this.database.update(
      id,
      await this.beforeUpdate(_.omit(role, ['users']), newData),
    );
  }

  public async remove(id: string): Promise<boolean | Error> {
    if (await this.database.remove(id)) return true;

    return new Error('Role not found');
  }

  public async assignUsers(
    id: string,
    userId: string,
  ): Promise<boolean | Error> {
    const role = await this.database.findOne(id);

    if (!role) return new Error('Role not found');

    return await this.database.assignUser(id, userId);
  }

  public async unassignUsers(
    id: string,
    userId: string,
  ): Promise<boolean | Error> {
    const role = await this.database.findOne(id);

    if (!role) return new Error('Role not found');

    return await this.database.unassignUser(id, userId);
  }
}
