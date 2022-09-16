import {
  HttpException,
  HttpStatus,
  Controller,
  UsePipes,
  Post,
  Body,
  Patch,
  Param,
} from '@nestjs/common';

import { JoiValidationPipe } from '@/core/pipes/joi-validation.pipe';

import { RolesService } from '@/roles/roles.service';

import { CreateRoleDto } from '@/roles/dto/create-roles.dto';
import { UpdateRoleDto } from '@/roles/dto/update-roles.dto';
import { AssignUserRoleDto } from '@/roles/dto/assign-user-roles.dto';
import { UnassignUserRoleDto } from '@/roles/dto/unassign-user-roles.dto';

import { CreateRoleSchema } from '@/roles/dto/schemas/create-roles-joi.schema';
import { UpdateRoleSchema } from '@/roles/dto/schemas/update-roles-joi.schema';
import { AssignUserRoleSchema } from '@/roles/dto/schemas/assign-user-roles-joi.schema';
import { UnassignUserRoleSchema } from '@/roles/dto/schemas/unassign-user-roles-joi.schema';

import { RolesParser } from '@/roles/parsers/roles.parser';

@Controller('api/roles')
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    private readonly rolesParser: RolesParser,
  ) {}

  @Post()
  @UsePipes(new JoiValidationPipe(CreateRoleSchema))
  async create(@Body() data: CreateRoleDto) {
    const role = await this.rolesService.create(data);

    if (role instanceof Error)
      throw new HttpException(role.message, HttpStatus.FORBIDDEN);

    return this.rolesParser.toJSON(role);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(UpdateRoleSchema))
    data: UpdateRoleDto,
  ) {
    const role = await this.rolesService.update(id, data);

    if (role instanceof Error)
      throw new HttpException(role.message, HttpStatus.FORBIDDEN);

    return this.rolesParser.toJSON(role);
  }

  @Post('assign/user')
  async assignUser(
    @Body(new JoiValidationPipe(AssignUserRoleSchema))
    data: AssignUserRoleDto,
  ) {
    const assign = await this.rolesService.assignUser(data);

    if (assign instanceof Error)
      throw new HttpException(assign.message, HttpStatus.FORBIDDEN);

    return assign;
  }

  @Post('unassign/user')
  async unassignUser(
    @Body(new JoiValidationPipe(UnassignUserRoleSchema))
    data: UnassignUserRoleDto,
  ) {
    const unassign = await this.rolesService.unassignUser(data);

    if (unassign instanceof Error)
      throw new HttpException(unassign.message, HttpStatus.FORBIDDEN);

    return unassign;
  }
}
