import { PersonB2 } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { FindThrowErrorController } from '@/graphql/controllers/FindThrowErrorController';

export class FindPersonB2Controller {
    async handle(request: Request, response: Response) {
        const {
            id
        } = request.params;

        const findThrowErrorController = new FindThrowErrorController();

        return response.json(await findThrowErrorController.handle<PersonB2 | null>(
            prismaClient.personB2.findFirst({
                where: {
                    id
                },
                include: {
                    person: {
                        include: {
                            cards: true,
                            scale: true,
                            address: {
                                include: {
                                    street: true,
                                    neighborhood: true,
                                    city: true,
                                    district: true
                                }
                            },
                            personService: {
                                include: {
                                    service: true
                                }
                            }
                        }
                    }
                }
            }),
            'Não foi possível retornar a pessoa que está cobrindo.'
        ));
    }
}