/**
 * @description Gerenciador de informações com o banco de dados
 * @author @GuilhermeSantos001
 * @update 16/12/2021
 */

import jobDB, { jobInterface, jobModelInterface } from '@/mongo/jobs-manager-mongo';
import Moment from '@/utils/moment';

class jobManagerDB {
    /**
     * @description Registra o serviço
     */
    public async register(job: jobInterface): Promise<boolean> {
        try {
            const model = await jobDB.create({
                ...job,
                createdAt: Moment.format()
            });

            await model.validate();
            await model.save();

            return true;
        } catch {
            throw new TypeError(`Não foi possível registrar o serviço ${job.name}`);
        }
    }

    /**
     * @description Atualiza o serviço
     */
    public async update(cid: string, data: { status: string, error?: string }): Promise<boolean> {
        await jobDB.updateOne({ cid }, { $set: data });

        return true;
    }

    /**
     * @description Remove o serviço
     */
    public async remove(cid: string): Promise<boolean> {
        await jobDB.deleteOne({ cid });

        return true;
    }

    /**
     * @description Remove o serviço
     */
    public async removeByName(name: string): Promise<boolean> {
        await jobDB.deleteOne({ name });

        return true;
    }

    /**
     * @description Restaura o status dos serviços
     */
    public async reset(): Promise<boolean> {
        await jobDB.updateMany({ status: { $ne: 'Finish' } }, { $set: { status: 'Available' }, $unset: { error: "" } });

        return true;
    }

    /**
     * @description Deleta todos os serviços
     */
    public async clear(): Promise<boolean> {
        await jobDB.deleteMany({});

        return true;
    }

    /**
     * @description Retorna os serviços
     */
    public async get(): Promise<jobModelInterface[]> {
        let jobs: jobModelInterface[] = [];

        jobs = await jobDB.find({});

        return jobs;
    }
}

export default new jobManagerDB();