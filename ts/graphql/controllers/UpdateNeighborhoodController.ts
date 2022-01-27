import { Neighborhood } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/db/prismaClient';
import { UpdateThrowErrorController } from '@/graphql/controllers/UpdateThrowErrorController';

export class UpdateNeighborhoodController {
  async handle(request: Request, response: Response) {
    const
      { id } = request.params,
      {
        value
      }: Pick<Neighborhood, 'value'> = request.body;

    const updateThrowErrorController = new UpdateThrowErrorController();

    return response.json(await updateThrowErrorController.handle<Neighborhood>(
      prismaClient.neighborhood.update({
        where: {
          id
        },
        data: {
          value
        }
      }),
      'Não foi possível atualizar o serviço.'
    ));
  }
}