import { PersonCoverage } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { CreateThrowErrorController } from '@/graphql/controllers/CreateThrowErrorController';

import { ResponseThrowErrorController } from '@/graphql/controllers/ResponseThrowErrorController';
import { DatabaseModalityOfCoverageConstants } from '@/graphql/constants/DatabaseModalityOfCoverageConstants';

export class CreatePersonCoverageController {
    async handle(request: Request, response: Response) {
        const {
            mirrorId,
            personId,
            modalityOfCoverage
        }: Pick<PersonCoverage, 'mirrorId' | 'personId'|'modalityOfCoverage'> = request.body;

        const createThrowErrorController = new CreateThrowErrorController();
        const responseThrowErrorController = new ResponseThrowErrorController();
        const databaseModalityOfCoverageConstants = new DatabaseModalityOfCoverageConstants();

        if (databaseModalityOfCoverageConstants.notValid(modalityOfCoverage))
            return response.json(await responseThrowErrorController.handle(
                new Error(`A modalidade de cobertura deve está entre [${databaseModalityOfCoverageConstants.values().join(', ')}].`),
                'Propriedade modalityOfCoverage inválida.',
            ));

        return response.json(await createThrowErrorController.handle<PersonCoverage>(
            prismaClient.personCoverage.create({
                data: {
                    mirrorId,
                    personId,
                    modalityOfCoverage
                }
            }),
            'Não foi possível criar a pessoa que está cobrindo.'
        ));
    }
}