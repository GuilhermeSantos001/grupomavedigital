import { District } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { UpdateThrowErrorController } from '@/graphql/controllers/UpdateThrowErrorController';

export class UpdateDistrictController {
  async handle(request: Request, response: Response) {
    const
      { id } = request.params,
      {
        value
      }: Pick<District, 'value'> = request.body;

    const updateThrowErrorController = new UpdateThrowErrorController();

    return response.json(await updateThrowErrorController.handle<District>(
      prismaClient.district.update({
        where: {
          id
        },
        data: {
          value
        }
      }),
      'Não foi possível atualizar o distrito (Estado).'
    ));
  }
}