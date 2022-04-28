import { PersonCoverage } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { UpdateThrowErrorController } from '@/graphql/controllers/UpdateThrowErrorController';

import { ResponseThrowErrorController } from '@/graphql/controllers/ResponseThrowErrorController';
import { DatabaseModalityOfCoverageConstants } from '@/graphql/constants/DatabaseModalityOfCoverageConstants';

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
    const responseThrowErrorController = new ResponseThrowErrorController();
    const databaseModalityOfCoverageConstants = new DatabaseModalityOfCoverageConstants();

    if (databaseModalityOfCoverageConstants.notValid(modalityOfCoverage))
        return response.json(await responseThrowErrorController.handle(
            new Error(`A modalidade de cobertura deve está entre [${databaseModalityOfCoverageConstants.values().join(', ')}].`),
            'Propriedade modalityOfCoverage inválida.',
        ));

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