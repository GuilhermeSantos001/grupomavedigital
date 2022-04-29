import { PersonCovering } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { FindThrowErrorController } from '@/graphql/controllers/FindThrowErrorController';

export class FindPersonCoveringController {
    async handle(request: Request, response: Response) {
        const {
            id
        } = request.params;

        const findThrowErrorController = new FindThrowErrorController();

        return response.json(await findThrowErrorController.handle<PersonCovering | null>(
            prismaClient.personCovering.findFirst({
                where: {
                    id
                },
                include: {
                    mirror: true,
                    person: {
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
                    },
                    reasonForAbsence: true
                }
            }),
            'Não foi possível retornar a pessoa que está sendo coberta.'
        ));
    }
}