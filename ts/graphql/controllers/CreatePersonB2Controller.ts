import { PersonB2 } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { CreateThrowErrorController } from '@/graphql/controllers/CreateThrowErrorController';
import { ResponseThrowErrorController } from '@/graphql/controllers/ResponseThrowErrorController';

export class CreatePersonB2Controller {
    async handle(request: Request, response: Response) {
        const {
            personId
        }: Pick<PersonB2, 'personId'> = request.body;

        const createThrowErrorController = new CreateThrowErrorController();
        const responseThrowErrorController = new ResponseThrowErrorController();

        if (await prismaClient.personB2.findFirst({
            where: {
                OR: [
                    // ? Verifica se já existe a mesma pessoa de B2
                    {
                        personId
                    }
                ]
            }
        }))
            return response.json(await responseThrowErrorController.handle(
                new Error(`Não foi possível criar a pessoa do B2. A pessoa informada já pertence a um B2.`),
                'Tente novamente!',
            ));
        else if (await prismaClient.personPH.findFirst({
            where: {
                OR: [
                    // ? Verifica se já existe a mesma pessoa no Pacote de Horas
                    {
                        personId
                    }
                ]
            }
        }))
            return response.json(await responseThrowErrorController.handle(
                new Error(`Não foi possível criar a pessoa do B2. A pessoa informada já pertence a um Pacote de Horas.`),
                'Tente novamente!',
            ));

        return response.json(await createThrowErrorController.handle<PersonB2>(
            prismaClient.personB2.create({
                data: {
                    personId
                }
            }),
            'Não foi possível criar a pessoa que está no B2.'
        ));
    }
}