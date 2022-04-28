import { PackageHours } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { CreateThrowErrorController } from '@/graphql/controllers/CreateThrowErrorController';
import { ResponseThrowErrorController } from '@/graphql/controllers/ResponseThrowErrorController';

import { DatabaseStatusConstants } from '../constants/DatabaseStatusConstants';
import { DatabasePaymentStatusConstants } from '../constants/DatabasePaymentStatusConstants';
import { DatabasePaymentMethodConstants } from '../constants/DatabasePaymentMethodConstants';

export class CreatePackageHoursController {
    async handle(request: Request, response: Response) {
        const {
            author,
            costCenterId,
            periodStart,
            periodEnd,
            description,
            personId,
            workplacePHDestinationId,
            contractStartedAt,
            contractFinishAt,
            entryTime,
            exitTime,
            valueClosed,
            lawdays,
            jobTitle,
            onlyHistory,
            paymentMethod,
            paymentValue,
            paymentDatePayable,
            paymentStatus,
            paymentDatePaid,
            paymentDateCancelled,
            status
        }: Pick<PackageHours,
            | 'author'
            | 'costCenterId'
            | 'periodStart'
            | 'periodEnd'
            | 'description'
            | 'personId'
            | 'workplacePHDestinationId'
            | 'contractStartedAt'
            | 'contractFinishAt'
            | 'entryTime'
            | 'exitTime'
            | 'valueClosed'
            | 'lawdays'
            | 'jobTitle'
            | 'onlyHistory'
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

        return response.json(await createThrowErrorController.handle<PackageHours>(
            prismaClient.packageHours.create({
                data: {
                    author,
                    costCenterId,
                    periodStart,
                    periodEnd,
                    description,
                    personId,
                    workplacePHDestinationId,
                    contractStartedAt,
                    contractFinishAt,
                    entryTime,
                    exitTime,
                    valueClosed,
                    lawdays,
                    jobTitle,
                    onlyHistory,
                    paymentMethod,
                    paymentValue,
                    paymentDatePayable,
                    paymentStatus,
                    paymentDatePaid,
                    paymentDateCancelled,
                    status
                }
            }),
            'Não foi possível criar o Pacote de Horas.'
        ));
    }
}