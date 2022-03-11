import { Posting } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { FindThrowErrorController } from '@/graphql/controllers/FindThrowErrorController';

export class FindPostingController {
    async handle(request: Request, response: Response) {
        const {
            id
        } = request.params;

        const findThrowErrorController = new FindThrowErrorController();

        return response.json(await findThrowErrorController.handle<Posting | null>(
            prismaClient.posting.findFirst({
                where: {
                    id
                },
                include: {
                    costCenter: true,
                    covering: {
                      include: {
                        person: true,
                        mirror: true,
                        reasonForAbsence: true,
                      }
                    },
                    coverage: {
                      include: {
                        person: true,
                        mirror: true,
                      }
                    },
                    coveringWorkplace: {
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
                    },
                    coverageWorkplace: {
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
                    }
                }
            }),
            'Não foi possível retornar o lançamento financeiro.'
        ));
    }
}