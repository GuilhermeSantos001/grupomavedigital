/**
 * @description Envio de emails padronizados
 * @author @GuilhermeSantos001
 * @update 17/07/2020
 * @version 1.1.1
 */

import Mail, { Templates, Priority } from "@/core/nodemailer";
import BASE_URL from "@/utils/getBaseURL";

declare type Options = {
    email: string;
    subject: string;
    title: string;
    priority: Priority;
    variables: object;
}

export default class MailSend {
    constructor() {
        throw new Error('this is static class');
    };

    static baseurl = BASE_URL;

    /**
     * @description Envia o email de confirmação da conta
     */
    static async econfirm(email: string, username: string, token: string, temporarypass: string | null) {
        try {
            const options: Options = {
                email: email,
                subject: 'Confirmação de cadastro',
                title: `Prezado(a) ${username}, por gentileza clique no link a baixo para confirmar sua conta!`,
                priority: 'high',
                variables: {
                    username,
                    url: `${MailSend.baseurl}/user/email/confirm?token=${token}`,
                    temporarypass: typeof temporarypass === 'string' ? true : false,
                    temporarypassValue: temporarypass
                }
            };

            return await Mail.send({
                to: [options.email],
                subject: options.subject,
                priority: options.priority
            }, Templates.ECONFIRM, {
                title: options.title,
                variables: options.variables
            });
        } catch (error: any) {
            throw new Error(error);
        };
    };

    /**
     * @description Envia o email de recuperação da conta
     */
    static async accountRetrieveTwofactor(email: string, username: string, token: string) {
        try {
            const options: Options = {
                email: email,
                subject: 'Recuperação da Conta',
                title: `Prezado(a) ${username}, por gentileza clique no link a baixo para recuperar sua conta!`,
                priority: 'high',
                variables: {
                    username,
                    url: `${MailSend.baseurl}/user/email/confirm?token=${token}`
                }
            };

            return await Mail.send({
                to: [options.email],
                subject: options.subject,
                priority: options.priority
            }, Templates.ACCOUNT_RETRIEVE, {
                title: options.title,
                variables: options.variables
            });
        } catch (error: any) {
            throw new Error(error);
        };
    };

    /**
     * @description Envia o email de novo acesso por um endereço de IP fora do historico
     */
    static async sessionNewAccess(email: string, username: string, navigator: { browser: string, os: string, locationIP: string, internetAdress: string }) {
        try {
            const options: Options = {
                email: email,
                subject: 'Novo Acesso Detectado!',
                title: `Prezado(a) ${username}, detectamos um novo acesso em sua conta!`,
                priority: 'high',
                variables: {
                    username,
                    browser: navigator.browser,
                    os: navigator.os,
                    locationIP: navigator.locationIP,
                    internetAdress: navigator.internetAdress.replace('::ffff:', '')
                }
            };

            return await Mail.send({
                to: [options.email],
                subject: options.subject,
                priority: options.priority
            }, Templates.SESSION_NEW_ACCESS, {
                title: options.title,
                variables: options.variables
            });
        } catch (error: any) {
            throw new Error(error);
        };
    };

    /**
     * @description Envia o email com o pedido aos procuradores do arquivo/pasta
     */
    static async herculesOrders(email: string, username: string, title: string, description: string, link: string) {
        try {
            const options: Options = {
                email: email,
                subject: title,
                title: `Prezado(a) ${username}, nova solicitação!`,
                priority: 'high',
                variables: {
                    username,
                    description,
                    link,
                    linkHelp: process.env.NODE_ENV === 'development' ? `http://${process.env.APP_HOST}:${process.env.APP_PORT}/system/storage/hercules/help` : `https://grupomavedigital.com.br/system/storage/hercules/help`
                }
            };

            return await Mail.send({
                to: [options.email],
                subject: options.subject,
                priority: options.priority
            }, Templates.HERCULES_ORDERS, {
                title: options.title,
                variables: options.variables
            });
        } catch (error: any) {
            throw new Error(error);
        };
    };
};