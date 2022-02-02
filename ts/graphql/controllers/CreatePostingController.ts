import { Posting } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { CreateThrowErrorController } from '@/graphql/controllers/CreateThrowErrorController';
import { ResponseThrowErrorController } from '@/graphql/controllers/ResponseThrowErrorController';

import { DatabaseStatusConstants } from '../constants/DatabaseStatusConstants';
import { DatabasePaymentStatusConstants } from '../constants/DatabasePaymentStatusConstants';
import { DatabasePaymentMethodConstants } from '../constants/DatabasePaymentMethodConstants';

export class CreatePostingController {
    async handle(request: Request, response: Response) {
        const {
            author,
            costCenterId,
            periodStart,
            periodEnd,
            originDate,
            description,
            coveringId,
            coverageId,
            coveringWorkplaceId,
            coverageWorkplaceId,
            paymentMethod,
            paymentValue,
            paymentDatePayable,
            paymentStatus,
            paymentDatePaid,
            paymentDateCancelled,
            foremanApproval,
            managerApproval,
            status
        }: Pick<Posting,
            | 'author'
            | 'costCenterId'
            | 'periodStart'
            | 'periodEnd'
            | 'originDate'
            | 'description'
            | 'coveringId'
            | 'coverageId'
            | 'coveringWorkplaceId'
            | 'coverageWorkplaceId'
            | 'paymentMethod'
            | 'paymentValue'
            | 'paymentDatePayable'
            | 'paymentStatus'
            | 'paymentDatePaid'
            | 'paymentDateCancelled'
            | 'foremanApproval'
            | 'managerApproval'
            | 'status'
        > = request.body;

        const createThrowErrorController = new CreateThrowErrorController();
        const responseThrowErrorController = new ResponseThrowErrorController();

        const databaseStatusConstants = new DatabaseStatusConstants();
        const databasePaymentStatusConstants = new DatabasePaymentStatusConstants();
        const databasePaymentMethodConstants = new DatabasePaymentMethodConstants();

        if (await prismaClient.posting.findFirst({
            where: {
                OR: [
                    // ? Verifica se existe algum lançamento na mesma data de
                    // ? origem, dentro do mesmo período
                    {
                        periodStart,
                        periodEnd,
                        originDate,
                    },
                    // ? Verifica se existe algum lançamento em que o posto
                    // ? a pessoa já está sendo coberta
                    {
                        periodStart,
                        periodEnd,
                        originDate,
                        coveringId
                    },
                    // ? Verifica se existe algum lançamento em que o posto
                    // ? a pessoa já está cobrindo
                    {
                        periodStart,
                        periodEnd,
                        originDate,
                        coverageId
                    },
                    // ? Verifica se existe algum lançamento em que o posto
                    // ? já está sendo coberto na data de origem
                    {
                        periodStart,
                        periodEnd,
                        originDate,
                        coveringWorkplaceId
                    },
                    // ? Verifica se existe algum lançamento em que o posto
                    // ? já está sendo usado por alguma pessoa que está cobrindo
                    {
                        periodStart,
                        periodEnd,
                        originDate,
                        coverageWorkplaceId
                    }
                ]
            }
        }))
            return response.json(await responseThrowErrorController.handle(
                new Error(`Não foi possível criar o lançamento. Verifique os dados informados.`),
                'Tente novamente!',
            ));

        if (coveringId === coverageId)
            return response.json(await responseThrowErrorController.handle(
                new Error(`A pessoa que está sendo coberta, não pode ser a mesma pessoa que está cobrindo.`),
                'Tente com outra pessoa.',
            ));

        if (coveringWorkplaceId === coverageWorkplaceId)
            return response.json(await responseThrowErrorController.handle(
                new Error(`O posto que está sendo coberto, não pode ser o posto de cobertura.`),
                'Tente com outra pessoa.',
            ));

        if (databasePaymentStatusConstants.notValid(paymentStatus))
            return response.json(await responseThrowErrorController.handle(
                new Error(`O status de pagamento deve está entre [${databasePaymentStatusConstants.status().join(', ')}].`),
                'Propriedade paymentStatus inválida.',
            ));

        if (databasePaymentMethodConstants.notValid(paymentMethod))
            return response.json(await responseThrowErrorController.handle(
                new Error(`O metodo de pagamento deve está entre [${databasePaymentMethodConstants.status().join(', ')}].`),
                'Propriedade paymentMethod inválida.',
            ));

        if (databaseStatusConstants.notValid(status))
            return response.json(await responseThrowErrorController.handle(
                new Error(`O status deve está entre [${databaseStatusConstants.status().join(', ')}].`),
                'Propriedade status inválida.',
            ));

        return response.json(await createThrowErrorController.handle<Posting>(
            prismaClient.posting.create({
                data: {
                    author,
                    costCenterId,
                    periodStart,
                    periodEnd,
                    originDate,
                    description,
                    coveringId,
                    coverageId,
                    coveringWorkplaceId,
                    coverageWorkplaceId,
                    paymentMethod,
                    paymentValue,
                    paymentDatePayable,
                    paymentStatus,
                    paymentDatePaid,
                    paymentDateCancelled,
                    foremanApproval,
                    managerApproval,
                    status
                }
            }),
            'Não foi possível criar o lançamento financeiro.'
        ));
    }
}