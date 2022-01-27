import { CostCenter } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/db/prismaClient';
import { UpdateThrowErrorController } from '@/graphql/controllers/UpdateThrowErrorController';

export class UpdateCostCenterController {
  async handle(request: Request, response: Response) {
    const
      { id } = request.params,
      {
        title
      }: Omit<CostCenter, 'id'> = request.body;

    const updateThrowErrorController = new UpdateThrowErrorController();

    return response.json(await updateThrowErrorController.handle<CostCenter>(
      prismaClient.costCenter.update({
        where: {
          id
        },
        data: {
          title
        }
      }),
      'Não foi possível atualizar o centro de custo.'
    ));
  }
}