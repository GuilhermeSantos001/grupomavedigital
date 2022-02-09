import { Person } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { CreateThrowErrorController } from '@/graphql/controllers/CreateThrowErrorController';
import { ResponseThrowErrorController } from '@/graphql/controllers/ResponseThrowErrorController';
import { ValidationMailController } from '@/graphql/controllers/ValidationMailController';

import { DatabaseStatusConstants } from '@/graphql/constants/DatabaseStatusConstants';

export class CreatePersonController {
    async handle(request: Request, response: Response) {
        const {
            matricule,
            name,
            cpf,
            rg,
            birthDate,
            motherName,
            mail,
            phone,
            addressId,
            scaleId,
            status,
        }: Pick<Person,
            | 'matricule'
            | 'name'
            | 'cpf'
            | 'rg'
            | 'birthDate'
            | 'motherName'
            | 'mail'
            | 'phone'
            | 'addressId'
            | 'scaleId'
            | 'status'
        > = request.body;

        const createThrowErrorController = new CreateThrowErrorController();
        const responseThrowErrorController = new ResponseThrowErrorController();
        const validationMailController = new ValidationMailController();

        const databaseStatusConstants = new DatabaseStatusConstants();

        if (name.length < 8)
            return response.json(await responseThrowErrorController.handle(
                new Error('Nome deve ter no mínimo 8 caracteres'),
                'Propriedade name inválida.',
            ));

            if (cpf.length !== 11)
            return response.json(await responseThrowErrorController.handle(
                new Error('CPF deve ter 11 caracteres'),
                'Propriedade cpf inválida.',
            ));

        if (rg.length !== 9)
            return response.json(await responseThrowErrorController.handle(
                new Error('RG deve ter 9 caracteres'),
                'Propriedade rg inválida.',
            ));

        if (phone.length !== 11)
            return response.json(await responseThrowErrorController.handle(
                new Error('Telefone deve ter 11 caracteres'),
                'Propriedade phone inválida.',
            ));

        if (!await validationMailController.handle(mail))
            return response.json(await responseThrowErrorController.handle(
                new Error('Formato do e-mail informado não está válido'),
                'Propriedade mail inválida.',
            ));

        if (databaseStatusConstants.notValid(status))
            return response.json(await responseThrowErrorController.handle(
                new Error(`O status deve está entre [${databaseStatusConstants.values().join(', ')}].`),
                'Propriedade status inválida.',
            ));

        return response.json(await createThrowErrorController.handle<Person>(
            prismaClient.person.create({
                data: {
                    matricule,
                    name,
                    cpf,
                    rg,
                    birthDate,
                    motherName,
                    mail,
                    phone,
                    addressId,
                    scaleId,
                    status,
                }
            }),
            'Não foi possível criar a pessoa.'
        ));
    }
}