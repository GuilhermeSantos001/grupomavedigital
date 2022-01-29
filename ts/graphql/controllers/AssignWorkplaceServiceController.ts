import { WorkplaceService } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/db/prismaClient';
import { UpdateThrowErrorController } from '@/graphql/controllers/UpdateThrowErrorController';
import { ResponseThrowErrorController } from '@/graphql/controllers/ResponseThrowErrorController';

export class AssignWorkplaceServiceController {
  async handle(request: Request, response: Response) {
    const
      {
        workplaceId,
        serviceId
      }: Pick<WorkplaceService, 'workplaceId' | 'serviceId'> = request.body;

    const updateThrowErrorController = new UpdateThrowErrorController();
    const responseThrowErrorController = new ResponseThrowErrorController();

    if (!workplaceId || workplaceId.length <= 0)
      return response.json(await responseThrowErrorController.handle(
        new Error('ID do local de trabalho deve ser informado.'),
        'Propriedade workplaceId inválida.',
      ));

    if (!serviceId || serviceId.length <= 0)
      return response.json(await responseThrowErrorController.handle(
        new Error('ID do serviço deve ser informado.'),
        'Propriedade serviceId inválida.',
      ));

    if (await prismaClient.workplaceService.findFirst({
      where: {
        workplaceId,
        serviceId
      }
    }))
      return response.json(await responseThrowErrorController.handle(
        new Error('Local de trabalho já possui o serviço.'),
        'Tente outro serviço.',
      ));

    return response.json(await updateThrowErrorController.handle<WorkplaceService>(
      prismaClient.workplaceService.create({
        data: {
          workplaceId,
          serviceId
        }
      }),
      'Não foi possível atribuir o local de trabalho ao serviço.'
    ));
  }
}