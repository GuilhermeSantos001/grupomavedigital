import { Workplace } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { CreateThrowErrorController } from '@/graphql/controllers/CreateThrowErrorController';
import { ResponseThrowErrorController } from '@/graphql/controllers/ResponseThrowErrorController';

import { DatabaseStatusConstants } from '@/graphql/constants/DatabaseStatusConstants';

export class CreateWorkplaceController {
    async handle(request: Request, response: Response) {
        const {
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

        if (await prismaClient.workplace.findFirst({
            where: {
                name,
                scaleId
            }
        }))
            return response.json(await responseThrowErrorController.handle(
                new Error(`Local de trabalho com o nome ${name} e escala ${scaleId} já registrado!`),
                'Objeto já existe.',
            ));


        if (databaseStatusConstants.notValid(status))
            return response.json(await responseThrowErrorController.handle(
                new Error(`O status deve está entre [${databaseStatusConstants.status().join(', ')}].`),
                'Propriedade status inválida.',
            ));

        return response.json(await createThrowErrorController.handle<Workplace>(
            prismaClient.workplace.create({
                data: {
                    name,
                    scaleId,
                    entryTime,
                    exitTime,
                    addressId,
                    status,
                }
            }),
            'Não foi possível criar o local de trabalho.'
        ));
    }
}