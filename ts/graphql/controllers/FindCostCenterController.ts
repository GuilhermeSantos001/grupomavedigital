import { CostCenter } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/db/prismaClient';
import { FindThrowErrorController } from '@/graphql/controllers/FindThrowErrorController';

export class FindCostCenterController {
    async handle(request: Request, response: Response) {
        const {
            id
        } = request.params;

        const findThrowErrorController = new FindThrowErrorController();

        return response.json(await findThrowErrorController.handle<CostCenter | null>(
            prismaClient.costCenter.findFirst({
                where: {
                    id
                },
                include: {
                    Card: {
                        select: {
                            id: true,
                            serialNumber: true,
                            lastCardNumber: true,
                        }
                    }
                }
            }),
            'Não foi possível retornar o centro de custo.'
        ));
    }
}