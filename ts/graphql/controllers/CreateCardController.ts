import { Card } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { CreateThrowErrorController } from '@/graphql/controllers/CreateThrowErrorController';
import { ResponseThrowErrorController } from '@/graphql/controllers/ResponseThrowErrorController';

import { DatabaseStatusConstants } from '@/graphql/constants/DatabaseStatusConstants';

export class CreateCardController {
    async handle(request: Request, response: Response) {
        const {
            costCenterId,
            serialNumber,
            lastCardNumber,
            personId,
            status
        }: Pick<Card, 'costCenterId' | 'serialNumber' | 'lastCardNumber' | 'personId' | 'status'> = request.body;

        const createThrowErrorController = new CreateThrowErrorController();
        const responseThrowErrorController = new ResponseThrowErrorController();

        const databaseStatusConstants = new DatabaseStatusConstants();

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
                new Error(`O status deve está entre [${databaseStatusConstants.status().join(', ')}].`),
                'Propriedade status inválida.',
            ));

        return response.json(await createThrowErrorController.handle<Card>(
            prismaClient.card.create({
                data: {
                    costCenterId,
                    serialNumber,
                    lastCardNumber,
                    personId,
                    status
                }
            }),
            'Não foi possível criar o cartão benefício (Alelo).'
        ));
    }
}