import { Card } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { UpdateThrowErrorController } from '@/graphql/controllers/UpdateThrowErrorController';

export class UnassignPersonCardController {
  async handle(request: Request, response: Response) {
    const
      { id } = request.params

    const updateThrowErrorController = new UpdateThrowErrorController();

    return response.json(await updateThrowErrorController.handle<Card>(
      prismaClient.card.update({
        where: {
          id
        },
        data: {
          personId: null
        }
      }),
      'Não foi possível desatribuir a pessoa do cartão benefício (Alelo).'
    ));
  }
}