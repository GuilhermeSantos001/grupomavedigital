import { Address } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
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
                    street: true,
                    neighborhood: true,
                    city: true,
                    district: true
                }
            }),
            'Não foi possível retornar o endereço.'
        ));
    }
}