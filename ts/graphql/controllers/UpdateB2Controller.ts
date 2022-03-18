import { B2 } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { CreateThrowErrorController } from '@/graphql/controllers/CreateThrowErrorController';
import { ResponseThrowErrorController } from '@/graphql/controllers/ResponseThrowErrorController';

import { DatabaseStatusConstants } from '../constants/DatabaseStatusConstants';
import { DatabasePaymentStatusConstants } from '../constants/DatabasePaymentStatusConstants';
import { DatabasePaymentMethodConstants } from '../constants/DatabasePaymentMethodConstants';

export class UpdateB2Controller {
    async handle(request: Request, response: Response) {
        const
            { id } = request.params,
            {
                author,
                costCenterId,
                periodStart,
                periodEnd,
                description,
                personId,
                workplaceOriginId,
                workplaceDestinationId,
                coverageStartedAt,
                entryTime,
                exitTime,
                valueClosed,
                absences,
                lawdays,
                discountValue,
                level,
                roleGratification,
                gratification,
                paymentMethod,
                paymentValue,
                paymentDatePayable,
                paymentStatus,
                paymentDatePaid,
                paymentDateCancelled,
                status
            }: Pick<B2,
                | 'author'
                | 'costCenterId'
                | 'periodStart'
                | 'periodEnd'
                | 'description'
                | 'personId'
                | 'workplaceOriginId'
                | 'workplaceDestinationId'
                | 'coverageStartedAt'
                | 'entryTime'
                | 'exitTime'
                | 'valueClosed'
                | 'absences'
                | 'lawdays'
                | 'discountValue'
                | 'level'
                | 'roleGratification'
                | 'gratification'
                | 'paymentMethod'
                | 'paymentValue'
                | 'paymentDatePayable'
                | 'paymentStatus'
                | 'paymentDatePaid'
                | 'paymentDateCancelled'
                | 'status'
            > = request.body;

        const createThrowErrorController = new CreateThrowErrorController();
        const responseThrowErrorController = new ResponseThrowErrorController();

        const databaseStatusConstants = new DatabaseStatusConstants();
        const databasePaymentStatusConstants = new DatabasePaymentStatusConstants();
        const databasePaymentMethodConstants = new DatabasePaymentMethodConstants();

        if (databasePaymentStatusConstants.notValid(paymentStatus))
            return response.json(await responseThrowErrorController.handle(
                new Error(`O status de pagamento deve está entre [${databasePaymentStatusConstants.values().join(', ')}].`),
                'Propriedade paymentStatus inválida.',
            ));

        if (databasePaymentMethodConstants.notValid(paymentMethod))
            return response.json(await responseThrowErrorController.handle(
                new Error(`O método de pagamento deve está entre [${databasePaymentMethodConstants.values().join(', ')}].`),
                'Propriedade paymentMethod inválida.',
            ));

        if (databaseStatusConstants.notValid(status))
            return response.json(await responseThrowErrorController.handle(
                new Error(`O status deve está entre [${databaseStatusConstants.values().join(', ')}].`),
                'Propriedade status inválida.',
            ));

        return response.json(await createThrowErrorController.handle<B2>(
            prismaClient.b2.update({
                where: { id },
                data: {
                    author,
                    costCenterId,
                    periodStart,
                    periodEnd,
                    description,
                    personId,
                    workplaceOriginId,
                    workplaceDestinationId,
                    coverageStartedAt,
                    entryTime,
                    exitTime,
                    valueClosed,
                    absences,
                    lawdays,
                    discountValue,
                    level,
                    roleGratification,
                    gratification,
                    paymentMethod,
                    paymentValue,
                    paymentDatePayable,
                    paymentStatus,
                    paymentDatePaid,
                    paymentDateCancelled,
                    status
                }
            }),
            'Não foi possível atualizar o B2.'
        ));
    }
}