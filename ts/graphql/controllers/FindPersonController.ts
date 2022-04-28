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
                    address: {
                        include: {
                            street: true,
                            neighborhood: true,
                            city: true,
                            district: true
                        }
                    },
                    scale: true,
                    cards: {
                        include: {
                            costCenter: true,
                        }
                    },
                    personService: {
                        include: {
                            service: true
                        }
                    }
                }
            }),
            'Não foi possível retornar a pessoa.'
        ));
    }
}