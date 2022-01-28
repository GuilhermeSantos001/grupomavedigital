import { Card } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/db/prismaClient';
import { FindThrowErrorController } from '@/graphql/controllers/FindThrowErrorController';

export class FindCardController {
    async handle(request: Request, response: Response) {
        const {
            id
        } = request.params;

        const findThrowErrorController = new FindThrowErrorController();

        return response.json(await findThrowErrorController.handle<Card | null>(
            prismaClient.card.findFirst({
                where: {
                    id
                },
                include: {
                    costCenter: {
                        select: {
                            title: true
                        }
                    },
                    person: {
                        select: {
                            matricule: true,
                            name: true
                        }
                    }
                }
            }),
            'Não foi possível retornar o cartão benefício (Alelo).'
        ));
    }
}