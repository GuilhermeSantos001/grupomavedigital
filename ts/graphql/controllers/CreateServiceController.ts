import { Service } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/db/prismaClient';
import { CreateThrowErrorController } from '@/graphql/controllers/CreateThrowErrorController';

export class CreateServiceController {
    async handle(request: Request, response: Response) {
        const {
            value
        }: Pick<Service, 'value'> = request.body;

        const createThrowErrorController = new CreateThrowErrorController();

        return response.json(await createThrowErrorController.handle<Service>(
            prismaClient.service.create({
                data: {
                    value
                }
            }),
            'Não foi possível criar o serviço.'
        ));
    }
}