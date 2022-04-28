import { APIKey } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { FindThrowErrorController } from '@/graphql/controllers/FindThrowErrorController';

export class FindAPIKeyController {
  async handle(request: Request, response: Response) {
    const {
      passphrase
    } = request.params;

    const findThrowErrorController = new FindThrowErrorController();

    return response.json(await findThrowErrorController.handle<APIKey | null>(
      prismaClient.aPIKey.findFirst({
        where: {
          passphrase
        }
      }),
      'Não foi possível retornar a chave de API.'
    ));
  }
}