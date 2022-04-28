import { City } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { UpdateThrowErrorController } from '@/graphql/controllers/UpdateThrowErrorController';

export class UpdateCityController {
  async handle(request: Request, response: Response) {
    const
      { id } = request.params,
      {
        value
      }: Pick<City, 'value'> = request.body;

    const updateThrowErrorController = new UpdateThrowErrorController();

    return response.json(await updateThrowErrorController.handle<City>(
      prismaClient.city.update({
        where: {
          id
        },
        data: {
          value
        }
      }),
      'Não foi possível atualizar a cidade.'
    ));
  }
}