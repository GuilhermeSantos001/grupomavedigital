import { Workplace } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/db/prismaClient';
import { CreateThrowErrorController } from '@/graphql/controllers/CreateThrowErrorController';
import { ResponseThrowErrorController } from '@/graphql/controllers/ResponseThrowErrorController';

import { DatabaseStatusConstants } from '@/graphql/constants/DatabaseStatusConstants';

export class UpdateWorkplaceController {
  async handle(request: Request, response: Response) {
    const
      { id } = request.params,
      {
        name,
        scaleId,
        entryTime,
        exitTime,
        addressId,
        status,
      }: Pick<Workplace,
        | 'name'
        | 'scaleId'
        | 'entryTime'
        | 'exitTime'
        | 'addressId'
        | 'status'
      > = request.body;

    const createThrowErrorController = new CreateThrowErrorController();
    const responseThrowErrorController = new ResponseThrowErrorController();

    const databaseStatusConstants = new DatabaseStatusConstants();

    if (databaseStatusConstants.notValid(status))
      return response.json(await responseThrowErrorController.handle(
        new Error(`O status deve está entre [${databaseStatusConstants.status().join(', ')}].`),
        'Propriedade status inválida.',
      ));

    return response.json(await createThrowErrorController.handle<Workplace>(
      prismaClient.workplace.update({
        where: { id },
        data: {
          name,
          scaleId,
          entryTime,
          exitTime,
          addressId,
          status,
        }
      }),
      'Não foi possível atualizar o local de trabalho.'
    ));
  }
}