import { Workplace } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/db/prismaClient';
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
                        select: {
                            street: {
                                select: {
                                    value: true
                                }
                            },
                            number: true,
                            complement: true,
                            neighborhood: {
                                select: {
                                    value: true
                                }
                            },
                            city: {
                                select: {
                                    value: true
                                }
                            },
                            district: {
                                select: {
                                    value: true
                                }
                            },
                            zipCode: true
                        }
                    },
                    scale: {
                        select: {
                            value: true
                        }
                    },
                    workplaceService: {
                        select: {
                            id: true,
                            service: {
                                select: {
                                    value: true
                                }
                            }
                        }
                    }
                }
            }),
            'Não foi possível retornar o local de trabalho.'
        ));
    }
}