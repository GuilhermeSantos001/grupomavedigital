import { Card } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/db/prismaClient';
import { UpdateThrowErrorController } from '@/graphql/controllers/UpdateThrowErrorController';
import { ResponseThrowErrorController } from '@/graphql/controllers/ResponseThrowErrorController';

export class AssignPersonCardController {
  async handle(request: Request, response: Response) {
    const
      { id } = request.params,
      {
        personId
      }: Pick<Card, 'personId'> = request.body;

    const updateThrowErrorController = new UpdateThrowErrorController();
    const responseThrowErrorController = new ResponseThrowErrorController();

    if (!personId || personId.length <= 0)
      return response.json(await responseThrowErrorController.handle(
        new Error('PersonId deve ser informado.'),
        'Propriedade personId inválida.',
      ));

    return response.json(await updateThrowErrorController.handle<Card>(
      prismaClient.card.update({
        where: {
          id
        },
        data: {
          personId
        }
      }),
      'Não foi possível atribuir a pessoa ao cartão benefício (Alelo).'
    ));
  }
}