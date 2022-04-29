import { Workplace } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { FindThrowErrorController } from '@/graphql/controllers/FindThrowErrorController';

export class FindWorkplaceController {
    async handle(request: Request, response: Response) {
        const {
            id
        } = request.params;

        const findThrowErrorController = new FindThrowErrorController();

        return response.json(await findThrowErrorController.handle<Workplace | null>(
            prismaClient.workplace.findFirst({
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
                    workplaceService: {
                        include: {
                            service: true
                        }
                    }
                }
            }),
            'Não foi possível retornar o local de trabalho.'
        ));
    }
}