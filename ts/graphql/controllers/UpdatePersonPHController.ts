import { PersonPH } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { CreateThrowErrorController } from '@/graphql/controllers/CreateThrowErrorController';
import { ResponseThrowErrorController } from '@/graphql/controllers/ResponseThrowErrorController';

export class UpdatePersonPHController {
    async handle(request: Request, response: Response) {
        const
            { id } = request.params,
            {
                personId
            }: Pick<PersonPH, 'personId'> = request.body;

        const createThrowErrorController = new CreateThrowErrorController();
        const responseThrowErrorController = new ResponseThrowErrorController();

        if (await prismaClient.personB2.findFirst({
            where: {
                OR: [
                    // ? Verifica se já existe a mesma pessoa em outro Pacote de Horas
                    {
                        personId
                    }
                ]
            }
        }))
            return response.json(await responseThrowErrorController.handle(
                new Error(`Não foi possível atualizar a pessoa do Pacote de Horas. A pessoa informada já pertence a outro Pacote de Horas.`),
                'Tente novamente!',
            ));
        else if (await prismaClient.personB2.findFirst({
            where: {
                OR: [
                    // ? Verifica se já existe a mesma pessoa no B2
                    {
                        personId
                    }
                ]
            }
        }))
            return response.json(await responseThrowErrorController.handle(
                new Error(`Não foi possível atualizar a pessoa do Pacote de Horas. A pessoa informada já pertence a um B2.`),
                'Tente novamente!',
            ));

        return response.json(await createThrowErrorController.handle<PersonPH>(
            prismaClient.personPH.update({
                where: { id },
                data: {
                    personId
                }
            }),
            'Não foi possível atualizar a pessoa que está no Pacote de Horas.'
        ));
    }
}