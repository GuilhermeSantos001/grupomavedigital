import { Injectable } from '@nestjs/common';

import { CreateRoleDto } from '@/roles/dto/create-roles.dto';
import { UpdateRoleDto } from '@/roles/dto/update-roles.dto';
import { AssignUserRoleDto } from '@/roles/dto/assign-user-roles.dto';
import { UnassignUserRoleDto } from '@/roles/dto/unassign-user-roles.dto';

import { CreateRoleFactory } from '@/roles/factories/create-roles.factory';
import { UpdateRoleFactory } from '@/roles/factories/update-roles.factory';
import { AssignUserRoleFactory } from '@/roles/factories/assign-user-roles.factory';
import { UnassignUserRoleFactory } from '@/roles/factories/unassign-user-roles.factory';

import { PrismaService } from '@/core/prisma/prisma.service';
import { LocaleService } from '@/core/i18n/i18n.service';
import { JsonExService } from '@/core/libs/modules/json-ex.service';

@Injectable()
export class RolesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly localeService: LocaleService,
    private readonly jsonExService: JsonExService,
  ) {}

  async create(role: CreateRoleDto) {
    return await CreateRoleFactory.run(
      role,
      this.prismaService,
      this.localeService.method,
      this.jsonExService.method,
    );
  }

  async update(id: string, newData: UpdateRoleDto) {
    return await UpdateRoleFactory.run(
      id,
      newData,
      this.prismaService,
      this.localeService.method,
      this.jsonExService.method,
    );
  }

  async assignUser(assign: AssignUserRoleDto) {
    return await AssignUserRoleFactory.run(
      assign,
      this.prismaService,
      this.localeService.method,
      this.jsonExService.method,
    );
  }

  async unassignUser(unassign: UnassignUserRoleDto) {
    return await UnassignUserRoleFactory.run(
      unassign,
      this.prismaService,
      this.localeService.method,
      this.jsonExService.method,
    );
  }
}
