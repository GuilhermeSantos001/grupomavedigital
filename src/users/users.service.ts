import { Injectable } from '@nestjs/common';

import { User } from '@prisma/client';

import { CreateUserDto } from '@/users/dto/create-users.dto';
import { UpdateUserDto } from '@/users/dto/update-users.dto';

import { CreateUserFactory } from '@/users/factories/create-users.factory';
import { ActivateUserFactory } from '@/users/factories/activate-users.factory';
import { LoginUserFactory } from '@/users/factories/login-users.factory';
import { SessionValidateUserFactory } from '@/users/factories/session-validate-users.factory';
import { LogoutUserFactory } from '@/users/factories/logout-users.factory';
import { FindAllUsersFactory } from '@/users/factories/find-all-users.factory';
import { FindByIdUserFactory } from '@/users/factories/find-by-id-users.factory';
import { FindByUserFactory } from '@/users/factories/find-by-users.factory';
import { UpdateUserFactory } from '@/users/factories/update-users.factory';
import { DecryptFieldValueUserFactory } from '@/users/factories/decrypt-field-value-users.factory';
import { RemoveUserFactory } from '@/users/factories/remove-users.factory';

import { GeoIP } from '@/core/types/geo-ip.type';

import { PrismaService } from '@/core/prisma/prisma.service';
import { LocaleService } from '@/core/i18n/i18n.service';
import { JsonExService } from '@/core/libs/modules/json-ex.service';

import { RecursivePartial } from '@/core/common/types/recursive-partial.type';
import { SimilarityType } from '@/core/utils/similarity-filter.util';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly localeService: LocaleService,
    private readonly jsonExService: JsonExService,
  ) {}

  async create(user: CreateUserDto) {
    return await CreateUserFactory.run(
      user,
      this.prismaService,
      this.localeService.method,
      this.jsonExService.method,
    );
  }

  async activate(id: string) {
    return await ActivateUserFactory.run(
      id,
      this.prismaService,
      this.localeService.method,
      this.jsonExService.method,
    );
  }

  async login(
    email: string,
    password: string,
    device_name: string,
    geo_ip: GeoIP,
  ) {
    return await LoginUserFactory.run(
      email,
      password,
      device_name,
      geo_ip,
      this.prismaService,
      this.localeService.method,
      this.jsonExService.method,
    );
  }

  async sessionValidate(
    id: string,
    token_value: string,
    token_signature: string,
    token_revalidate_value: string,
    token_revalidate_signature: string,
    device_name: string,
    geo_ip: GeoIP,
  ) {
    return await SessionValidateUserFactory.run(
      id,
      token_value,
      token_signature,
      token_revalidate_value,
      token_revalidate_signature,
      device_name,
      geo_ip,
      this.prismaService,
      this.localeService.method,
      this.jsonExService.method,
    );
  }

  async logout(id: string, token_value: string) {
    return await LogoutUserFactory.run(
      id,
      token_value,
      this.prismaService,
      this.localeService.method,
      this.jsonExService.method,
    );
  }

  async findAll() {
    return await FindAllUsersFactory.run(
      this.prismaService,
      this.localeService.method,
      this.jsonExService.method,
    );
  }

  async findOne(id: string) {
    return await FindByIdUserFactory.run(
      id,
      this.prismaService,
      this.localeService.method,
      this.jsonExService.method,
    );
  }

  async findBy(filter: RecursivePartial<User>, similarity?: SimilarityType) {
    return await FindByUserFactory.run(
      this.prismaService,
      this.localeService.method,
      this.jsonExService.method,
      filter,
      similarity,
    );
  }

  async decryptFieldValue(value: string) {
    return await DecryptFieldValueUserFactory.run(
      value,
      this.prismaService,
      this.localeService.method,
      this.jsonExService.method,
    );
  }

  async update(id: string, newData: UpdateUserDto) {
    return await UpdateUserFactory.run(
      id,
      newData,
      this.prismaService,
      this.localeService.method,
      this.jsonExService.method,
    );
  }

  async remove(id: string) {
    return await RemoveUserFactory.run(
      id,
      this.prismaService,
      this.localeService.method,
      this.jsonExService.method,
    );
  }
}
