import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Request } from 'express';

import { FindByIdUserFactory } from '@/users/factories/find-by-id-users.factory';

import { PrismaService } from '@/core/prisma/prisma.service';
import { LocaleService } from '@/core/i18n/i18n.service';
import { JsonExService } from '@/core/libs/modules/json-ex.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly prismaService: PrismaService,
    private readonly localeService: LocaleService,
    private readonly jsonExService: JsonExService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!roles) return true;

    const request = context.switchToHttp().getRequest<Request>();

    const id = request.headers['user_id'] as string;

    const user = await FindByIdUserFactory.run(
      id,
      this.prismaService,
      this.localeService.method,
      this.jsonExService.method,
    );

    if (user instanceof Error) return false;

    return roles.some((name) => user.roles.find((role) => role.name === name));
  }
}
