import { Service } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { UpdateThrowErrorController } from '@/graphql/controllers/UpdateThrowErrorController';

export class UpdateServiceController {
  async handle(request: Request, response: Response) {
    const
      { id } = request.params,
      {
        value
      }: Pick<Service, 'value'> = request.body;

    const updateThrowErrorController = new UpdateThrowErrorController();

    return response.json(await updateThrowErrorController.handle<Service>(
      prismaClient.service.update({
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