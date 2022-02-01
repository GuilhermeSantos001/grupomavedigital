import { CostCenter } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { UpdateThrowErrorController } from '@/graphql/controllers/UpdateThrowErrorController';

export class UpdateCostCenterController {
  async handle(request: Request, response: Response) {
    const
      { id } = request.params,
      {
        value
      }: Pick<CostCenter, 'value'> = request.body;

    const updateThrowErrorController = new UpdateThrowErrorController();

    return response.json(await updateThrowErrorController.handle<CostCenter>(
      prismaClient.costCenter.update({
        where: {
          id
        },
        data: {
          value
        }
      }),
      'Não foi possível atualizar o centro de custo.'
    ));
  }
}