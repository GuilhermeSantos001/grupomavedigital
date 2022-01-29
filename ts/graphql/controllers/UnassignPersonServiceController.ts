import { PersonService } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/db/prismaClient';
import { UpdateThrowErrorController } from '@/graphql/controllers/UpdateThrowErrorController';

export class UnassignPersonServiceController {
  async handle(request: Request, response: Response) {
    const { id } = request.params;

    const updateThrowErrorController = new UpdateThrowErrorController();

    return response.json(await updateThrowErrorController.handle<PersonService>(
      prismaClient.personService.delete({
        where: {
          id
        }
      }),
      'Não foi possível desatribuir a pessoa do serviço.'
    ));
  }
}