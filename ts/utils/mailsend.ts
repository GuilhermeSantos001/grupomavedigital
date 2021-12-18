/**
 * @description Envio de emails padronizados
 * @author @GuilhermeSantos001
 * @update 29/09/2020
 */

import Mail, { Templates, Priority } from "@/core/nodemailer";
import BASE_URL from "@/utils/getBaseURL";
import SMTPTransport from "nodemailer/lib/smtp-transport";

interface IVariablesEconfirm {
    username: string
    url: string
    temporarypass: boolean
    temporarypassValue: string | null
}

interface IVariablesForgotPassword {
    username: string
    signature: string
    url: string
}

interface IVariablesAccountRetrieveTwofactor {
    username: string
    url: string
}

interface IVariablesSessionNewAccess {
    username: string
    browser: string
    os: string
    locationIP: string
    internetAdress: string
}

interface IVariablesHerculesOrders {
    username: string
    description: string
    link: string
    linkHelp: string
}

declare type Options = {
    email: string;
    subject: string;
    title: string;
    priority: Priority;
    variables:
    IVariablesEconfirm |
    IVariablesForgotPassword |
    IVariablesAccountRetrieveTwofactor |
    IVariablesSessionNewAccess |
    IVariablesHerculesOrders;
}

export default class MailSend {
    constructor() {
        throw new TypeError('this is static class');
    }

    static baseurl = BASE_URL;

    /**
     * @description Envia o e-mail de confirmação da conta
     */
    static async econfirm(email: string, username: string, token: string, temporarypass: string | null): Promise<SMTPTransport.SentMessageInfo> {
        try {
            const options: Options = {
                email: email,
                subject: 'Confirmação de cadastro',
                title: `Prezado(a) ${username}, por gentileza clique no link a baixo para confirmar sua conta!`,
                priority: 'high',
                variables: {
                    username,
                    url: `${MailSend.baseurl}/user/mail/confirm?token=${token}`,
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
        } catch (error) {
            throw new TypeError(String(error));
        }
    }

    /**
     * @description Envia o e-mail para confirmar a troca da senha
     */
    static async accountForgotPassword(email: string, username: string, signature: string, token: string): Promise<SMTPTransport.SentMessageInfo> {
        try {
            const options: Options = {
                email: email,
                subject: 'Perdeu sua senha?',
                title: `Prezado(a) ${username}, perdeu sua senha?`,
                priority: 'high',
                variables: {
                    username,
                    signature,
                    url: `${MailSend.baseurl}/auth/password/restore?token=${token}`
                }
            };

            return await Mail.send({
                to: [options.email],
                subject: options.subject,
                priority: options.priority
            }, Templates.FORGOT_PASSWORD, {
                title: options.title,
                variables: options.variables
            });
        } catch (error) {
            throw new TypeError(String(error));
        }
    }

    /**
     * @description Envia o e-mail de recuperação da conta
     */
    static async accountRetrieveTwofactor(email: string, username: string, token: string): Promise<SMTPTransport.SentMessageInfo> {
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
        } catch (error) {
            throw new TypeError(String(error));
        }
    }

    /**
     * @description Envia o e-mail de novo acesso por um endereço de IP fora do historico
     */
    static async sessionNewAccess(email: string, username: string, navigator: { browser: string, os: string, locationIP: string, internetAdress: string }): Promise<SMTPTransport.SentMessageInfo> {
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
        } catch (error) {
            throw new TypeError(String(error));
        }
    }

    /**
     * @description Envia o e-mail com o pedido aos procuradores do arquivo/pasta
     */
    static async herculesOrders(email: string, username: string, title: string, description: string, link: string): Promise<SMTPTransport.SentMessageInfo> {
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
        } catch (error) {
            throw new TypeError(String(error));
        }
    }
}