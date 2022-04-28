import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { DeleteThrowErrorController } from '@/graphql/controllers/DeleteThrowErrorController';

export class DeletePersonCoveringController {
    async handle(request: Request, response: Response) {
        const {
            id
        } = request.params;

        const deleteThrowErrorController = new DeleteThrowErrorController();

        return response.json(await deleteThrowErrorController.handle(
            prismaClient.personCovering.delete({
                where: {
                    id
                }
            }),
            'Não foi possível deletar a pessoa que está sendo coberta.'
        ));
    }
}