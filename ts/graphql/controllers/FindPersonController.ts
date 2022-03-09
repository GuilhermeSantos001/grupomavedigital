import { Person } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { FindThrowErrorController } from '@/graphql/controllers/FindThrowErrorController';

export class FindPersonController {
    async handle(request: Request, response: Response) {
        const {
            id
        } = request.params;

        const findThrowErrorController = new FindThrowErrorController();

        return response.json(await findThrowErrorController.handle<Person | null>(
            prismaClient.person.findFirst({
                where: {
                    id
                },
                include: {
                    address: true,
                    scale:true,
                    personService:true,
                    cards: true
                }
            }),
            'Não foi possível retornar a pessoa.'
        ));
    }
}