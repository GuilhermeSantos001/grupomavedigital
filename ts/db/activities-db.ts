/**
 * @description Gerenciador de informações com o banco de dados
 * @author @GuilhermeSantos001
 * @update 15/12/2021
 */

import activityDB, { activityInterface, activityModelInterface } from '@/mongo/activities-manager-mongo';
import { PrivilegesSystem } from '@/mongo/user-manager-mongo';
import Moment from '@/utils/moment';

export interface ActivityInfo {
    ipremote: string;
    auth: string;
    privileges: PrivilegesSystem[];
    roadmap: string;
    createdAt?: string;
}

class activityManagerDB {
    /**
     * @description Registra a atividade
     */
    public async register(activity: activityInterface): Promise<boolean> {
        const model = await activityDB.create({
            ...activity,
            createdAt: Moment.format()
        });

        await model.validate();
        await model.save();

        return true;
    }

    /**
     * @description Retorna as ultimas atividades com limite de itens a serem retornados
     */
    public async get(limit: number): Promise<ActivityInfo[]> {
        const _activities = await activityDB.find({}).sort({ $natural: -1 }).limit(limit);

        return _activities.map((activity: activityModelInterface) => {
            return {
                id: activity._id,
                ipremote: activity.ipremote,
                auth: activity.auth,
                privileges: activity.privileges,
                roadmap: activity.roadmap,
                createdAt: activity.createdAt
            }
        });
    }
}

export default new activityManagerDB();