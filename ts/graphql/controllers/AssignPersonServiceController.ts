import { PersonService } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/db/prismaClient';
import { UpdateThrowErrorController } from '@/graphql/controllers/UpdateThrowErrorController';
import { ResponseThrowErrorController } from '@/graphql/controllers/ResponseThrowErrorController';

export class AssignPersonServiceController {
  async handle(request: Request, response: Response) {
    const
      {
        personId,
        serviceId
      }: Pick<PersonService, 'personId' | 'serviceId'> = request.body;

    const updateThrowErrorController = new UpdateThrowErrorController();
    const responseThrowErrorController = new ResponseThrowErrorController();

    if (!personId || personId.length <= 0)
      return response.json(await responseThrowErrorController.handle(
        new Error('ID da pessoa deve ser informado.'),
        'Propriedade personId inválida.',
      ));

    if (!serviceId || serviceId.length <= 0)
      return response.json(await responseThrowErrorController.handle(
        new Error('ID do serviço deve ser informado.'),
        'Propriedade serviceId inválida.',
      ));

    if (await prismaClient.personService.findFirst({
      where: {
        personId,
        serviceId
      }
    }))
      return response.json(await responseThrowErrorController.handle(
        new Error('Pessoa já possui o serviço.'),
        'Tente outro serviço.',
      ));

    return response.json(await updateThrowErrorController.handle<PersonService>(
      prismaClient.personService.create({
        data: {
          personId,
          serviceId
        }
      }),
      'Não foi possível atribuir a pessoa ao serviço.'
    ));
  }
}