import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { DeleteThrowErrorController } from '@/graphql/controllers/DeleteThrowErrorController';

export class DeleteCityController {
    async handle(request: Request, response: Response) {
        const {
            id
        } = request.params;

        const deleteThrowErrorController = new DeleteThrowErrorController();

        return response.json(await deleteThrowErrorController.handle(
            prismaClient.city.delete({
                where: {
                    id
                }
              }),
            'Não foi possível deletar a cidade.'
        ));
    }
}