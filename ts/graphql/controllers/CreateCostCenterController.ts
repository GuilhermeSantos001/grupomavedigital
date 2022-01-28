import { CostCenter } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/db/prismaClient';
import { CreateThrowErrorController } from '@/graphql/controllers/CreateThrowErrorController';

export class CreateCostCenterController {
    async handle(request: Request, response: Response) {
        const {
            value
        }: Pick<CostCenter, 'value'> = request.body;

        const createThrowErrorController = new CreateThrowErrorController();

        return response.json(await createThrowErrorController.handle<CostCenter>(
            prismaClient.costCenter.create({
                data: {
                    value
                }
            }),
            'Não foi possível criar o centro de custo.'
        ));
    }
}