import { Address } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/db/prismaClient';
import { FindThrowErrorController } from '@/graphql/controllers/FindThrowErrorController';

export class FindAddressController {
    async handle(request: Request, response: Response) {
        const {
            id
        } = request.params;

        const findThrowErrorController = new FindThrowErrorController();

        return response.json(await findThrowErrorController.handle<Address | null>(
            prismaClient.address.findFirst({
                where: {
                    id
                },
                include: {
                    street: {
                        select: {
                            value: true
                        }
                    },
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
                    }
                }
            }),
            'Não foi possível retornar o endereço.'
        ));
    }
}