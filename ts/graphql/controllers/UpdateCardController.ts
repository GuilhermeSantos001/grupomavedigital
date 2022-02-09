import { Card } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { UpdateThrowErrorController } from '@/graphql/controllers/UpdateThrowErrorController';
import { ResponseThrowErrorController } from '@/graphql/controllers/ResponseThrowErrorController';

import { DatabaseStatusConstants } from '@/graphql/constants/DatabaseStatusConstants';

export class UpdateCardController {
  async handle(request: Request, response: Response) {
    const
      { id } = request.params,
      {
        costCenterId,
        lotNum,
        serialNumber,
        lastCardNumber,
        personId,
        status
      }: Pick<Card, 'costCenterId' | 'lotNum' | 'serialNumber' | 'lastCardNumber' | 'personId' | 'status'> = request.body;

    const updateThrowErrorController = new UpdateThrowErrorController();
    const responseThrowErrorController = new ResponseThrowErrorController();

    const databaseStatusConstants = new DatabaseStatusConstants();

    if (lotNum.length !== 9)
      return response.json(await responseThrowErrorController.handle(
        new Error('O número de lote deve ter 9 dígitos.'),
        'Propriedade lotNum inválida.',
      ));

    if (serialNumber.length !== 15)
      return response.json(await responseThrowErrorController.handle(
        new Error('O número de série deve ter 15 dígitos.'),
        'Propriedade serialNumber inválida.',
      ));

    if (lastCardNumber.length !== 4)
      return response.json(await responseThrowErrorController.handle(
        new Error('Os 4 últimos dígitos do cartão deve conter 4 números.'),
        'Propriedade lastCardNumber inválida.',
      ));

    if (databaseStatusConstants.notValid(status))
      return response.json(await responseThrowErrorController.handle(
        new Error(`O status deve está entre [${databaseStatusConstants.values().join(', ')}].`),
        'Propriedade status inválida.',
      ));

    return response.json(await updateThrowErrorController.handle<Card>(
      prismaClient.card.update({
        where: {
          id
        },
        data: {
          costCenterId,
          lotNum,
          serialNumber,
          lastCardNumber,
          personId,
          status
        }
      }),
      'Não foi possível atualizar o cartão benefício (Alelo).'
    ));
  }
}