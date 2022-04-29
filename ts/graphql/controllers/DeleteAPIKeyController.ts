import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { DeleteThrowErrorController } from '@/graphql/controllers/DeleteThrowErrorController';

export class DeleteAPIKeyController {
  async handle(request: Request, response: Response) {
    const {
      passphrase
    } = request.params;

    const deleteThrowErrorController = new DeleteThrowErrorController();

    return response.json(await deleteThrowErrorController.handle(
      prismaClient.aPIKey.delete({
        where: {
          passphrase
        }
      }),
      'Não foi possível deletar a chave de API.'
    ));
  }
}