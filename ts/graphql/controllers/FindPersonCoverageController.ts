import { PersonCoverage } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { FindThrowErrorController } from '@/graphql/controllers/FindThrowErrorController';

export class FindPersonCoverageController {
    async handle(request: Request, response: Response) {
        const {
            id
        } = request.params;

        const findThrowErrorController = new FindThrowErrorController();

        return response.json(await findThrowErrorController.handle<PersonCoverage | null>(
            prismaClient.personCoverage.findFirst({
                where: {
                    id
                },
                include: {
                    mirror: {
                        select: {
                            authorId: true,
                            fileId: true,
                            filename: true,
                            filetype: true,
                            description: true,
                            version: true,
                            size: true,
                            compressedSize: true,
                            temporary: true,
                            expiredAt: true,
                        }
                    }
                }
            }),
            'Não foi possível retornar a pessoa que está cobrindo.'
        ));
    }
}