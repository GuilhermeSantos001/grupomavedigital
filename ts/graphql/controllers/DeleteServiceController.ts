import { Request, Response } from 'express';

import { prismaClient } from '@/db/prismaClient';
import { DeleteThrowErrorController } from '@/graphql/controllers/DeleteThrowErrorController';

export class DeleteServiceController {
    async handle(request: Request, response: Response) {
        const {
            id
        } = request.params;

        const deleteThrowErrorController = new DeleteThrowErrorController();

        return response.json(await deleteThrowErrorController.handle(
            prismaClient.service.delete({
                where: {
                    id
                }
              }),
            'Não foi possível deletar o serviço.'
        ));
    }
}