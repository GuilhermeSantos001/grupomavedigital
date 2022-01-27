import { Request, Response } from 'express';

import { prismaClient } from '@/db/prismaClient';
import { DeleteThrowErrorController } from '@/graphql/controllers/DeleteThrowErrorController';

export class DeleteScaleController {
    async handle(request: Request, response: Response) {
        const {
            id
        } = request.params;

        const deleteThrowErrorController = new DeleteThrowErrorController();

        return response.json(await deleteThrowErrorController.handle(
            prismaClient.scale.delete({
                where: {
                    id
                }
              }),
            'Não foi possível deletar a escala de trabalho.'
        ));
    }
}