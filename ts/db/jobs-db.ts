/**
 * @description Gerenciador de informações com o banco de dados
 * @author @GuilhermeSantos001
 * @update 01/09/2021
 * @version 1.4.1
 */

import jobDB, { jobInterface, jobModelInterface } from '@/mongo/jobs-manager-mongo';
import Moment from '@/utils/moment';

class jobManagerDB {
    /**
     * @description Registra o serviço
     */
    public register(job: jobInterface) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const model = await jobDB.create({
                    ...job,
                    createdAt: Moment.format()
                });

                await model.validate();
                await model.save();

                return resolve(true);
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Atualiza o serviço
     */
    public update(cid: string, data: { status: string, error?: string }): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {
                await jobDB.updateMany({ cid }, { $set: data });

                return resolve(true);
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Remove o serviço
     */
    public remove(cid: string) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                await jobDB.deleteMany({ cid });

                return resolve(true);
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Remove o serviço
     */
    public removeByName(name: string) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                await jobDB.deleteMany({ name });

                return resolve(true);
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Restaura o status dos serviços
     */
    public reset() {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                await jobDB.updateMany({ status: { $ne: 'Finish' } }, { $set: { status: 'Available' }, $unset: { error: "" } });

                return resolve(true);
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Deleta todos os serviços
     */
    public clear() {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                await jobDB.deleteMany({});

                return resolve(true);
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Retorna os serviços
     */
    public get() {
        return new Promise<jobModelInterface[]>(async (resolve, reject) => {
            try {
                let jobs: jobModelInterface[] = [];

                jobs = await jobDB.find({});

                return resolve(jobs);
            } catch (error) {
                return reject(error);
            }
        });
    }
}

export default new jobManagerDB();