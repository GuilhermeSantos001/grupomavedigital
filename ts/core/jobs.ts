/**
 * @description Gerenciador de Processamentos Paralelos
 * @author @GuilhermeSantos001
 * @update 01/08/2021
 * @version 1.3.6
 */

import { v4 } from 'uuid';

import REDIS from '@/core/redis';
import { jobInterface, jobModelInterface } from '@/mongo/jobs-manager-mongo';
import jobManagerDB from '@/db/jobs-db';
import mailsend from '@/utils/mailsend';
import Debug from '@/core/log4';
import Moment from '@/utils/moment';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export default class Jobs {

    static readonly db: number = 5;
    static readonly delay: number = 60000; // 1 Minute

    constructor() {
        throw new Error('this is static class');
    }

    static jobs: jobModelInterface[] = [];

    static process: NodeJS.Timeout;

    static isWorking(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const client = new REDIS(this.db);

            client.get(`jobsWorking`, (response: boolean, values: unknown[]) => {
                client.disconnect();

                if (!response)
                    return reject();

                if (values.filter(value => value !== '').length > 0) {
                    if (values[0] === 'true') {
                        return resolve(true);
                    } else {
                        return resolve(false);
                    }
                }

                return resolve(false);
            });
        });
    }

    static setWork(status: string): Promise<boolean> {
        return new Promise((resolve) => {
            const client = new REDIS(this.db);

            client.set(`jobsWorking`, status, (response: boolean) => {
                client.disconnect();

                if (!response) {
                    return resolve(false);
                }

                return resolve(true);
            });
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

    static clear(): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {
                return resolve(await jobManagerDB.clear());
            } catch (error) {
                return reject(error);
            }
        });
    }

    static async save(job: jobInterface): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                await jobManagerDB.register(job);

                return resolve();
            } catch (error) {
                return reject(error);
            }
        });
    }

    static async load(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                this.jobs = await jobManagerDB.get();

                return resolve();
            } catch (error) {
                return reject(error);
            }
        });
    }

    static async updateJob(cid: string, data: { status: string, error?: string }): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                await jobManagerDB.update(cid, data);

                return resolve();
            } catch (error) {
                return reject(error);
            }
        });
    }

    static async removeJob(cid: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                await jobManagerDB.remove(cid);

                return resolve();
            } catch (error) {
                return reject(error);
            }
        });
    }

    static async removeJobByName(name: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {
                return resolve(await jobManagerDB.removeByName(name));
            } catch (error) {
                return reject(error);
            }
        });
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

    static append(job: jobInterface): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
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

                return resolve(true);
            } catch (error) {
                return reject(error);
            }
        });
    }

    static async splice(job: jobInterface): Promise<void> {
        await this.removeJob(job.cid || "");

        if (this.jobs.filter(_job => _job.cid !== job.cid).length <= 0)
            await this.setWork('false');
    }

    static async start(): Promise<void> {
        await this.setWork('true');

        this.process = setTimeout(this.update.bind(this), this.delay);
    }

    static async update(): Promise<void> {
        if (await this.isWorking()) {
            await this.load();

            for (const job of this.jobs) {
                if (job.runAt) {
                    const
                        now = new Date(),
                        date = new Date(job.date || '');

                    if (now >= date) {
                        try {
                            await this.run(job);

                            break;
                        } catch (error) {
                            Debug.info('jobs', `Job(${job.cid}) processing error`, String(error));

                            break;
                        }
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
        }

        if (this.process)
            clearTimeout(this.process);

        this.process = setTimeout(this.update.bind(this), this.delay);
    }

    static async run(job: jobModelInterface): Promise<void> {
        return new Promise(async (resolve, reject) => {
            if (this.isAvailable(job)) {
                try {
                    Debug.info('jobs', `Job(${job.cid}) started process`);

                    if (job.type === 'mailsend') {
                        Debug.info('jobs', `Job(${job.cid}) processing mail send...`);

                        job.status = 'Processing';

                        await this.updateJob(job.cid || '', { status: job.status });
                        await this.mailsend(job);

                        return resolve();
                    }
                } catch (error) {
                    return reject(error);
                }
            }
            else if (this.isFinish(job)) {
                try {
                    Debug.info('jobs', `Job(${job.cid}) finish with success!`);

                    await this.splice(job);

                    return resolve();
                } catch (error) {
                    return reject(error);
                }
            }
            else if (this.isError(job)) {
                try {
                    Debug.fatal('jobs', `Job(${job.cid}) error`, job.error || "");
                    Debug.info('jobs', `Job(${job.cid}) will be processed again...`);

                    job.status = 'Available';

                    await this.updateJob(job.cid || '', { status: job.status, error: undefined });

                    return resolve();
                } catch (error) {
                    return reject(error);
                }
            }
        });
    }

    static async mailsend(job: jobModelInterface): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const args = job.args;

            try {
                if ('temporarypass' in args) {
                    mailsend.econfirm(args.email, args.username, args.token, args.temporarypass)
                        .then(async (info: SMTPTransport.SentMessageInfo) => {
                            try {
                                Debug.info('user', `Email de confirmação da conta enviado para o usuário(${args.auth})`, JSON.stringify(info), `IP-Request: ${args.clientAddress}`);

                                job.status = 'Finish';

                                await this.updateJob(job.cid || '', { status: job.status });

                                return resolve();
                            } catch (error) {
                                return reject(error);
                            }
                        })
                        .catch(async error => {
                            try {
                                Debug.fatal('user', `Erro ocorrido na hora de enviar o email de confirmação da conta do usuário(${args.auth})`, error, `IP-Request: ${args.clientAddress}`);

                                job.status = 'Error';
                                job.error = error;

                                await this.updateJob(job.cid || '', { status: job.status, error: job.error });

                                return resolve();
                            } catch (error) {
                                return reject(error);
                            }
                        });
                }
                else if ('navigator' in args) {
                    mailsend.sessionNewAccess(args.email, args.username, args.navigator)
                        .then(async (info: SMTPTransport.SentMessageInfo) => {
                            try {
                                Debug.info('user', `Email de novo acesso da conta enviado para o usuário(${args.email})`, JSON.stringify(info), `IP-Request: ${args.clientAddress}`);

                                job.status = 'Finish';

                                await this.updateJob(job.cid || '', { status: job.status });

                                return resolve();
                            } catch (error) {
                                return reject(error);
                            }
                        })
                        .catch(async error => {
                            try {
                                Debug.fatal('user', `Erro ocorrido na hora de enviar o email de novo acesso da conta do usuário(${args.email})`, error, `IP-Request: ${args.clientAddress}`);

                                job.status = 'Error';
                                job.error = error;

                                await this.updateJob(job.cid || '', { status: job.status, error: job.error });

                                return resolve();
                            } catch (error) {
                                return reject(error);
                            }
                        });
                }
                else if ('twofactor' in args) {
                    mailsend.accountRetrieveTwofactor(args.email, args.username, args.token)
                        .then(async (info: SMTPTransport.SentMessageInfo) => {
                            try {
                                Debug.info('user', `Email de recuperação da conta(${args.email}) enviado`, JSON.stringify(info), `IP-Request: ${args.clientAddress}`);

                                job.status = 'Finish';

                                await this.updateJob(job.cid || '', { status: job.status });

                                return resolve();
                            } catch (error) {
                                return reject(error);
                            }
                        })
                        .catch(async error => {
                            try {
                                Debug.fatal('user', `Erro na hora de enviar o email de recuperação da conta(${args.email})`, error, `IP-Request: ${args.clientAddress}`);

                                job.status = 'Error';
                                job.error = error;

                                await this.updateJob(job.cid || '', { status: job.status, error: job.error });

                                return resolve();
                            } catch (error) {
                                return reject(error);
                            }
                        });
                } else if ('order' in args) {
                    mailsend.herculesOrders(args.email, args.username, args.title, args.description, args.link)
                        .then(async (info: SMTPTransport.SentMessageInfo) => {
                            try {
                                Debug.info('user', `Email com o pedido aos procuradores do arquivo/pasta enviado para ${args.email}`, JSON.stringify(info), `IP-Request: ${args.clientAddress}`);

                                job.status = 'Finish';

                                await this.updateJob(job.cid || '', { status: job.status });

                                return resolve();
                            } catch (error) {
                                return reject(error);
                            }
                        })
                        .catch(async error => {
                            try {
                                Debug.fatal('user', `Erro na hora de enviar o email com o pedido aos procuradores do arquivo/pasta enviado para ${args.email}`, error, `IP-Request: ${args.clientAddress}`);

                                job.status = 'Error';
                                job.error = error;

                                await this.updateJob(job.cid || '', { status: job.status, error: job.error });

                                return resolve();
                            } catch (error) {
                                return reject(error);
                            }
                        });
                }
            } catch (error) {
                job.status = 'Error';
                job.error = JSON.stringify(error);

                await this.updateJob(job.cid || '', { status: job.status, error: job.error });

                return reject(error);
            }
        });
    }
}