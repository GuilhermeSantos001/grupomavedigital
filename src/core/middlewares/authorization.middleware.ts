import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';

import { Request, Response, NextFunction } from 'express';

import { StringEx } from '@/core/utils/string-ex.util';

import { LocaleService } from '@/core/i18n/i18n.service';

@Injectable()
export class AuthorizationMiddleware implements NestMiddleware {
  constructor(private readonly localeService: LocaleService) {}

  private async _invalidMasterKey(authorization: string) {
    if (StringEx.Hash(process.env.MASTER_KEY, 'sha1', 'hex') !== authorization)
      return true;

    return false;
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const headers = req.headers,
      authorization = headers.authorization;

    if (await this._invalidMasterKey(authorization))
      throw new HttpException(
        this.localeService.translate(
          'middlewares.authorization.exception',
        ) as string,
        HttpStatus.UNAUTHORIZED,
      );

    next();
  }
}
