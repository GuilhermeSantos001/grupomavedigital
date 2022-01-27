import { Scale } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/db/prismaClient';
import { UpdateThrowErrorController } from '@/graphql/controllers/UpdateThrowErrorController';

export class UpdateScaleController {
  async handle(request: Request, response: Response) {
    const
      { id } = request.params,
      {
        value
      }: Pick<Scale, 'value'> = request.body;

    const updateThrowErrorController = new UpdateThrowErrorController();

    return response.json(await updateThrowErrorController.handle<Scale>(
      prismaClient.scale.update({
        where: {
          id
        },
        data: {
          value
        }
      }),
      'Não foi possível atualizar a escala de trabalho.'
    ));
  }
}