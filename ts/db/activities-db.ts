/**
 * @description Gerenciador de informações com o banco de dados
 * @author @GuilhermeSantos001
 * @update 01/09/2021
 * @version 1.1.5
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
    public register(activity: activityInterface) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                try {
                    const model = await activityDB.create({
                        ...activity,
                        createdAt: Moment.format()
                    });

                    await model.validate();
                    await model.save();
                } catch (error) {
                    return reject(error);
                }

                return resolve(true);
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Retorna as ultimas atividades com limite de itens a serem retornados
     */
    public get(limit: number) {
        return new Promise<ActivityInfo[]>(async (resolve, reject) => {
            try {
                let activities: ActivityInfo[];

                try {
                    const _activities = await activityDB.find({ }).sort({ $natural: -1 }).limit(limit);

                    activities = _activities.map((activity: activityModelInterface) => {
                        return {
                            id: activity._id,
                            ipremote: activity.ipremote,
                            auth: activity.auth,
                            privileges: activity.privileges,
                            roadmap: activity.roadmap,
                            createdAt: activity.createdAt
                        }
                    })
                } catch (error) {
                    return reject(error);
                }

                return resolve(activities);
            } catch (error) {
                return reject(error);
            }
        });
    }
}

export default new activityManagerDB();