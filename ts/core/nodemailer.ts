/**
 * @description Envio de Emails
 * @author @GuilhermeSantos001
 * @update 13/08/2021
 * @version 1.1.1
 */

import * as nodemailer from "nodemailer";
import { pugEngine } from "nodemailer-pug-engine";

import { localPath } from '@/utils/localpath';

export type Priority = 'high' | 'normal' | 'low';

declare type Recipient = {
    to: string[],
    subject: string,
    cc?: string[],
    cco?: string[],
    priority?: Priority;
};

declare type CTX = {
    title: string;
    variables: object;
};

export enum Templates {
    DEFAULT = "default",
    TESTING = "testMail",
    ECONFIRM = "econfirm",
    ACCOUNT_RETRIEVE = "accountRetrieve",
    SESSION_NEW_ACCESS = "sessionNewAccess",
    HERCULES_ORDERS = "herculesOrders",
};

export default class Mail {

    constructor() {
        throw new Error('this is static class');
    };

    static test(recipient: Recipient) {
        return Mail.send(recipient,
            Templates.TESTING,
            {
                title: 'Testando o envio de mensagens',
                variables: {}
            });
    };

    static send(recipient: Recipient, template: Templates, variables: CTX) {
        return new Promise<any>(async (resolve, reject) => {
            const mailOptions = {
                from: '"Grupo Mave Digital(✉)" <grupomavedigital@grupomave.com.br>',
                to: String(recipient.to),
                cc: recipient.cc || [],
                bcc: recipient.cco || [],
                priority: recipient.priority || 'normal',
                subject: String(recipient.subject),
                template: String(template),
                ctx: variables
            };

            const transporter = nodemailer.createTransport({
                host: String(process.env.SMTP_HOST || "smtp.grupomave.com.br"),
                port: Number(process.env.SMTP_PORT || 587),
                secure: eval(String(process.env.SMTP_SECURE).toLowerCase() || "false"),
                auth: {
                    user: String(process.env.SMTP_USERNAME),
                    pass: String(process.env.SMTP_PASSWORD)
                }
            });

            transporter
                .verify((err, success) => {
                    if (err) return reject(err);

                    if (success) {
                        transporter
                            .use('compile', pugEngine({
                                templateDir: localPath('templates'),
                                pretty: true
                            }));

                        transporter
                            .sendMail(mailOptions)
                            .then(info => {
                                resolve(info);
                            }).catch(err => {
                                reject(err);
                            });
                    } else {
                        return reject(success);
                    };
                });
        });
    };
};