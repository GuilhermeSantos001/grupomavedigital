import { Posting } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { CreateThrowErrorController } from '@/graphql/controllers/CreateThrowErrorController';
import { ResponseThrowErrorController } from '@/graphql/controllers/ResponseThrowErrorController';

import { DatabaseStatusConstants } from '../constants/DatabaseStatusConstants';
import { DatabasePaymentStatusConstants } from '../constants/DatabasePaymentStatusConstants';
import { DatabasePaymentMethodConstants } from '../constants/DatabasePaymentMethodConstants';

import DateEx from '@/utils/dateEx';

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

        const postings = await prismaClient.posting.findMany({
            include: {
                coverageWorkplace: true
            }
        });

        let
            newEntryTime = null,
            newExitTime = null,
            newWorkShift = null;

        for (
            const posting of postings
                .filter(posting => DateEx.isEqual(new Date(originDate), new Date(posting.originDate)))
                .reverse()
        ) {
            /**
             * ? Verifique se a pessoa realizando a cobertura já está cobrindo
             */
            if (
                posting.coverageId === coverageId &&
                posting.coverageWorkplaceId !== coverageWorkplaceId
            )
                return response.json(await responseThrowErrorController.handle(
                    new Error(`
                    A pessoa que iria realizar a cobertura já está em outro posto.`
                    ),
                    'Tente outra pessoa.',
                ));

            /**
             * ? Verifique se o posto de cobertura já esta sendo coberto
             */
            if (
                coverageWorkplaceId
                && posting.coverageWorkplaceId === coverageWorkplaceId
                && posting.coverageWorkplace
            ) {
                let
                    entryTime,
                    exitTime;

                if (postings.length > 1) {
                    if (!posting.entryTime || !posting.exitTime) continue;

                    entryTime = new Date(posting.entryTime);
                    exitTime = new Date(posting.exitTime);
                } else {
                    const
                        workplaceEntryTime = new Date(posting.coverageWorkplace.entryTime),
                        workplaceExitTime = new Date(posting.coverageWorkplace.exitTime);

                    entryTime = new Date(originDate);
                    exitTime = new Date(originDate);

                    entryTime.setHours(workplaceEntryTime.getHours());
                    entryTime.setMinutes(workplaceEntryTime.getMinutes());
                    exitTime.setHours(workplaceExitTime.getHours());
                    exitTime.setMinutes(workplaceExitTime.getMinutes());
                }

                // * Regras do posto no segundo turno
                if (!posting.workShift || posting.workShift < 1) {
                    if (
                        DateEx.isAfter(new Date(), entryTime, true) &&
                        DateEx.isAfter(new Date(), exitTime, true)
                    ) {
                        newEntryTime = DateEx.addDays(entryTime, 1);
                        newExitTime = DateEx.addDays(exitTime, 1);

                        newWorkShift = 1;
                        break;
                    } else {
                        return response.json(await responseThrowErrorController.handle(
                            new Error(`O posto de cobertura já está ocupado. Por favor, tente novamente a partir das ${exitTime.toLocaleTimeString()} no dia ${exitTime.toLocaleDateString()}.`),
                            'Tente novamente mais tarde.',
                        ));
                    }
                }
                // * Regras do posto no primeiro turno
                else {
                    if (
                        DateEx.isAfter(new Date(), entryTime, true) &&
                        DateEx.isBefore(new Date(), exitTime, true)
                    ) {
                        newEntryTime = DateEx.addDays(entryTime, 1);
                        newExitTime = DateEx.addDays(exitTime, 1);

                        newWorkShift = null;
                        break;
                    } else {
                        return response.json(await responseThrowErrorController.handle(
                            new Error(`O turno do posto ainda não está liberado. Por favor, tente novamente a partir das ${entryTime.toLocaleTimeString()} ás ${exitTime.toLocaleTimeString()} no dia ${entryTime.toLocaleDateString()}.`),
                            'Tente novamente mais tarde.',
                        ));
                    }
                }
            }
        }

        if (coveringId === coverageId)
            return response.json(await responseThrowErrorController.handle(
                new Error(`A pessoa que está sendo coberta, não pode ser a mesma pessoa que está cobrindo.`),
                'Tente com outra pessoa.',
            ));

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

        return response.json(await createThrowErrorController.handle<Posting>(
            prismaClient.posting.create({
                data: {
                    author,
                    costCenterId,
                    periodStart,
                    periodEnd,
                    entryTime: newEntryTime,
                    exitTime: newExitTime,
                    workShift: newWorkShift,
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
            'Não foi possível criar o lançamento operacional.'
        ));
    }
}