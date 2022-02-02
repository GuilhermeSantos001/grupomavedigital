import { PersonCoverage } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { UpdateThrowErrorController } from '@/graphql/controllers/UpdateThrowErrorController';

export class UpdatePersonCoverageController {
  async handle(request: Request, response: Response) {
    const
      { id } = request.params,
      {
        mirrorId,
        personId,
        modalityOfCoverage
      }: Pick<PersonCoverage, 'mirrorId' | 'personId' | 'modalityOfCoverage'> = request.body;

    const updateThrowErrorController = new UpdateThrowErrorController();

    return response.json(await updateThrowErrorController.handle<PersonCoverage>(
      prismaClient.personCoverage.update({
        where: {
          id
        },
        data: {
          mirrorId,
          personId,
          modalityOfCoverage
        }
      }),
      'Não foi possível atualizar a pessoa que está cobrindo.'
    ));
  }
}