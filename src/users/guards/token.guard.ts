import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Request } from 'express';

import { FindByIdUserFactory } from '@/users/factories/find-by-id-users.factory';

import { PrismaService } from '@/core/prisma/prisma.service';
import { LocaleService } from '@/core/i18n/i18n.service';
import { JsonExService } from '@/core/libs/modules/json-ex.service';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly prismaService: PrismaService,
    private readonly localeService: LocaleService,
    private readonly jsonExService: JsonExService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const useToken = this.reflector.get<boolean>(
      'useToken',
      context.getHandler(),
    );

    if (!useToken) return true;

    const request = context.switchToHttp().getRequest<Request>();

    const id = request.headers['user_id'] as string,
      token_value = request.headers['token_value'] as string,
      token_signature = request.headers['token_signature'] as string,
      token_revalidate_value = request.headers[
        'token_revalidate_value'
      ] as string,
      token_revalidate_signature = request.headers[
        'token_revalidate_signature'
      ] as string;

    const user = await FindByIdUserFactory.run(
      id,
      this.prismaService,
      this.localeService.method,
      this.jsonExService.method,
    );

    if (user instanceof Error || !user.session) return false;

    const token = user.session['accessTokens'].find(
        (token) =>
          token.value === token_value && token.signature === token_signature,
      ),
      revalidateToken = (() => {
        if (!user.session['accessTokenRevalidate']) return null;

        if (
          user.session['accessTokenRevalidate'].value ===
            token_revalidate_value &&
          user.session['accessTokenRevalidate'].signature ===
            token_revalidate_signature
        ) {
          return user.session['accessTokenRevalidate'];
        }

        return null;
      })();

    if (!token || !revalidateToken) return false;

    if (
      new Date(token.expireIn) < new Date() &&
      new Date(revalidateToken.expireIn) < new Date()
    ) {
      return false;
    }

    return true;
  }
}
