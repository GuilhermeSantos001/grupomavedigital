import { WorkplaceService } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/db/prismaClient';
import { UpdateThrowErrorController } from '@/graphql/controllers/UpdateThrowErrorController';

export class UnassignWorkplaceServiceController {
  async handle(request: Request, response: Response) {
    const { id } = request.params;

    const updateThrowErrorController = new UpdateThrowErrorController();

    return response.json(await updateThrowErrorController.handle<WorkplaceService>(
      prismaClient.workplaceService.delete({
        where: {
          id
        }
      }),
      'Não foi possível desatribuir o local de trabalho do serviço.'
    ));
  }
}