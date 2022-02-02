import { PersonCoverage } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { CreateThrowErrorController } from '@/graphql/controllers/CreateThrowErrorController';

export class CreatePersonCoverageController {
    async handle(request: Request, response: Response) {
        const {
            mirrorId,
            personId,
            modalityOfCoverage
        }: Pick<PersonCoverage, 'mirrorId' | 'personId'|'modalityOfCoverage'> = request.body;

        const createThrowErrorController = new CreateThrowErrorController();

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