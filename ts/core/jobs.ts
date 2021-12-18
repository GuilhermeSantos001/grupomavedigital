/* eslint-disable no-async-promise-executor */
/**
 * @description Gerenciador de Processamentos Paralelos
 * @author @GuilhermeSantos001
 * @update 26/11/2021
 */

import { v4 } from 'uuid';

import Redis from '@/core/redis';
import { jobInterface, jobModelInterface } from '@/mongo/jobs-manager-mongo';
import jobManagerDB from '@/db/jobs-db';
import mailsend from '@/utils/mailsend';
import Debug from '@/core/log4';
import Moment from '@/utils/moment';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export default class Jobs {

    static readonly db: number = 5;
    static readonly delay: number = 30000; // 5 Segundos

    constructor() {
        throw new TypeError('this is static class');
    }

    static jobs: jobModelInterface[] = [];

    static process: NodeJS.Timeout;

    static isWorking(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                const value = await Redis(this.db).get(`jobsWorking`);

                if (!value)
                    return reject();

                resolve();
            } catch (error) {
                return reject(error);
            }
        });
    }

    static setWork(status: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                await Redis(this.db).set(`jobsWorking`, status);

                resolve();
            } catch (error) {
                return reject(error);
            }
        });
    }

    static reset(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                await this.setWork('false');
                await jobManagerDB.reset();

                return resolve();
            } catch (error) {
                return reject(error);
            }
        });
    }

    static async clear(): Promise<boolean> {
        try {
            return await jobManagerDB.clear();
        } catch (error) {
            throw new TypeError(error instanceof TypeError ? error.message : JSON.stringify(error));
        }
    }

    static async save(job: jobInterface): Promise<boolean> {
        try {
            return await jobManagerDB.register(job);
        } catch (error) {
            throw new TypeError(error instanceof TypeError ? error.message : JSON.stringify(error));
        }
    }

    static async load(): Promise<void> {
        try {
            this.jobs = await jobManagerDB.get();
        } catch (error) {
            throw new TypeError(error instanceof TypeError ? error.message : JSON.stringify(error));
        }
    }

    static async updateJob(cid: string, data: { status: string, error?: string }): Promise<boolean> {
        try {
            return await jobManagerDB.update(cid, data);
        } catch (error) {
            throw new TypeError(error instanceof TypeError ? error.message : JSON.stringify(error));
        }
    }

    static async removeJob(cid: string): Promise<boolean> {
        try {
            return await jobManagerDB.remove(cid);
        } catch (error) {
            throw new TypeError(error instanceof TypeError ? error.message : JSON.stringify(error));
        }
    }

    static async removeJobByName(name: string): Promise<boolean> {
        try {
            return await jobManagerDB.removeByName(name);
        } catch (error) {
            throw new TypeError(error instanceof TypeError ? error.message : JSON.stringify(error));
        }
    }

    static isAvailable(job: jobModelInterface): boolean {
        return job.isAvailable;
    }

    static isFinish(job: jobModelInterface): boolean {
        return job.isFinish;
    }

    static isError(job: jobModelInterface): boolean {
        return job.isError;
    }

    static async append(job: jobInterface): Promise<boolean> {
        try {
            if (job.runAt) {
                const now = new Date();

                if (job.runAt.type === 'Days') {
                    now.setDate(now.getDate() + job.runAt.add);
                }
                else if (job.runAt.type === 'hours') {
                    now.setHours(now.getHours() + job.runAt.add);
                }
                else if (job.runAt.type === 'minutes') {
                    now.setMinutes(now.getMinutes() + job.runAt.add);
                }
                else if (job.runAt.type === 'seconds') {
                    now.setSeconds(now.getSeconds() + job.runAt.add);
                }

                job.date = now.toISOString();
            }

            job.cid = v4();
            job.createdAt = Moment.format();

            await this.save(job);

            if (this.jobs.length <= 0)
                await this.setWork('true');

            return true;
        } catch (error) {
            throw new TypeError(error instanceof TypeError ? error.message : JSON.stringify(error));
        }
    }

    static async splice(job: jobInterface): Promise<void> {
        try {
            await this.removeJob(job.cid || "");

            if (this.jobs.filter(_job => _job.cid !== job.cid).length <= 0)
                await this.setWork('false');
        } catch (error) {
            throw new TypeError(error instanceof TypeError ? error.message : JSON.stringify(error));
        }
    }

    static async start(): Promise<void> {
        await this.setWork('true');

        if (this.process)
            clearTimeout(this.process);

        this.process = setTimeout(this.update.bind(this), this.delay);
    }

    static async update(): Promise<void> {
        try {
            await this.isWorking();
            await this.load();

            for (const job of this.jobs) {
                if (job.runAt) {
                    const
                        now = new Date(),
                        date = new Date(job.date || '');

                    if (now >= date)
                        try {
                            await this.run(job);

                            break;
                        } catch (error) {
                            Debug.info('jobs', `Job(${job.cid}) processing error`, String(error));

                            break;
                        }
                } else {
                    try {
                        await this.run(job);

                        break;
                    } catch (error) {
                        Debug.info('jobs', `Job(${job.cid}) processing error`, String(error));

                        break;
                    }
                }
            }

            if (this.jobs.length <= 0)
                await this.setWork('false');

            if (this.process)
                clearTimeout(this.process);

            this.process = setTimeout(this.update.bind(this), this.delay);
        } catch (error) {
            throw new TypeError(error instanceof TypeError ? error.message : JSON.stringify(error));
        }
    }

    static async run(job: jobModelInterface): Promise<void> {
        if (this.isAvailable(job)) {
            try {
                Debug.info('jobs', `Job(${job.cid}) started process`);

                if (job.type === 'mailsend') {
                    Debug.info('jobs', `Job(${job.cid}) processing mail send...`);

                    job.status = 'Processing';

                    await this.updateJob(job.cid || '', { status: job.status });
                    await this.mailsend(job);
                }
            } catch (error) {
                throw new TypeError(error instanceof TypeError ? error.message : JSON.stringify(error));
            }
        }
        else if (this.isFinish(job)) {
            try {
                Debug.info('jobs', `Job(${job.cid}) finish with success!`);

                await this.splice(job);
            } catch (error) {
                throw new TypeError(error instanceof TypeError ? error.message : JSON.stringify(error));
            }
        }
        else if (this.isError(job)) {
            try {
                Debug.fatal('jobs', `Job(${job.cid}) error`, job.error || "");
                Debug.info('jobs', `Job(${job.cid}) will be processed again...`);

                job.status = 'Available';

                await this.updateJob(job.cid || '', { status: job.status, error: undefined });
            } catch (error) {
                throw new TypeError(error instanceof TypeError ? error.message : JSON.stringify(error));
            }
        }
    }

    static async mailsend(job: jobModelInterface): Promise<void> {
        const args = job.args;

        try {
            if ('temporarypass' in args) {
                mailsend.econfirm(args.email, args.username, args.token, args.temporarypass)
                    .then(async (info: SMTPTransport.SentMessageInfo) => {
                        try {
                            Debug.info('user', `E-mail de confirmação da conta enviado para o usuário(${args.auth})`, JSON.stringify(info), `IP-Request: ${args.clientAddress}`);

                            job.status = 'Finish';

                            await this.updateJob(job.cid || '', { status: job.status });
                        } catch (error) {
                            throw new TypeError(error instanceof TypeError ? error.message : JSON.stringify(error));
                        }
                    })
                    .catch(async error => {
                        try {
                            Debug.fatal('user', `Erro ocorrido na hora de enviar o e-mail de confirmação da conta do usuário(${args.auth})`, error, `IP-Request: ${args.clientAddress}`);

                            job.status = 'Error';
                            job.error = error;

                            await this.updateJob(job.cid || '', { status: job.status, error: job.error });
                        } catch (error) {
                            throw new TypeError(error instanceof TypeError ? error.message : JSON.stringify(error));
                        }
                    });
            }
            else if ('navigator' in args) {
                mailsend.sessionNewAccess(args.email, args.username, args.navigator)
                    .then(async (info: SMTPTransport.SentMessageInfo) => {
                        try {
                            Debug.info('user', `E-mail de novo acesso da conta enviado para o usuário(${args.email})`, JSON.stringify(info), `IP-Request: ${args.clientAddress}`);

                            job.status = 'Finish';

                            await this.updateJob(job.cid || '', { status: job.status });
                        } catch (error) {
                            throw new TypeError(error instanceof TypeError ? error.message : JSON.stringify(error));
                        }
                    })
                    .catch(async error => {
                        try {
                            Debug.fatal('user', `Erro ocorrido na hora de enviar o e-mail de novo acesso da conta do usuário(${args.email})`, error, `IP-Request: ${args.clientAddress}`);

                            job.status = 'Error';
                            job.error = error;

                            await this.updateJob(job.cid || '', { status: job.status, error: job.error });
                        } catch (error) {
                            throw new TypeError(error instanceof TypeError ? error.message : JSON.stringify(error));
                        }
                    });
            }
            else if ('forgotPassword' in args) {
                mailsend.accountForgotPassword(args.email, args.username, args.signature, args.token)
                    .then(async (info: SMTPTransport.SentMessageInfo) => {
                        try {
                            Debug.info('user', `E-mail de alteração de senha da conta(${args.email}) enviado`, JSON.stringify(info), `IP-Request: ${args.clientAddress}`);

                            job.status = 'Finish';

                            await this.updateJob(job.cid || '', { status: job.status });
                        } catch (error) {
                            throw new TypeError(error instanceof TypeError ? error.message : JSON.stringify(error));
                        }
                    })
                    .catch(async error => {
                        try {
                            Debug.fatal('user', `Erro na hora de enviar o e-mail de alteração da senha da conta(${args.email})`, error, `IP-Request: ${args.clientAddress}`);

                            job.status = 'Error';
                            job.error = error;

                            await this.updateJob(job.cid || '', { status: job.status, error: job.error });
                        } catch (error) {
                            throw new TypeError(error instanceof TypeError ? error.message : JSON.stringify(error));
                        }
                    });
            }
            else if ('twofactor' in args) {
                mailsend.accountRetrieveTwofactor(args.email, args.username, args.token)
                    .then(async (info: SMTPTransport.SentMessageInfo) => {
                        try {
                            Debug.info('user', `E-mail de recuperação da conta(${args.email}) enviado`, JSON.stringify(info), `IP-Request: ${args.clientAddress}`);

                            job.status = 'Finish';

                            await this.updateJob(job.cid || '', { status: job.status });
                        } catch (error) {
                            throw new TypeError(error instanceof TypeError ? error.message : JSON.stringify(error));
                        }
                    })
                    .catch(async error => {
                        try {
                            Debug.fatal('user', `Erro na hora de enviar o e-mail de recuperação da conta(${args.email})`, error, `IP-Request: ${args.clientAddress}`);

                            job.status = 'Error';
                            job.error = error;

                            await this.updateJob(job.cid || '', { status: job.status, error: job.error });
                        } catch (error) {
                            throw new TypeError(error instanceof TypeError ? error.message : JSON.stringify(error));
                        }
                    });
            }
            else if ('order' in args) {
                mailsend.herculesOrders(args.email, args.username, args.title, args.description, args.link)
                    .then(async (info: SMTPTransport.SentMessageInfo) => {
                        try {
                            Debug.info('user', `E-mail com o pedido aos procuradores do arquivo/pasta enviado para ${args.email}`, JSON.stringify(info), `IP-Request: ${args.clientAddress}`);

                            job.status = 'Finish';

                            await this.updateJob(job.cid || '', { status: job.status });
                        } catch (error) {
                            throw new TypeError(error instanceof TypeError ? error.message : JSON.stringify(error));
                        }
                    })
                    .catch(async error => {
                        try {
                            Debug.fatal('user', `Erro na hora de enviar o e-mail com o pedido aos procuradores do arquivo/pasta enviado para ${args.email}`, error, `IP-Request: ${args.clientAddress}`);

                            job.status = 'Error';
                            job.error = error;

                            await this.updateJob(job.cid || '', { status: job.status, error: job.error });
                        } catch (error) {
                            throw new TypeError(error instanceof TypeError ? error.message : JSON.stringify(error));
                        }
                    });
            }
        } catch (error) {
            job.status = 'Error';
            job.error = JSON.stringify(error);

            try {
                await this.updateJob(job.cid || '', { status: job.status, error: job.error })
            } catch (error) {
                throw new TypeError(error instanceof TypeError ? error.message : JSON.stringify(error));
            }

            throw new TypeError(error instanceof TypeError ? error.message : JSON.stringify(error));
        }
    }
}