/**
 * @description Controle dos dados dos usuários no navegador.
 * @author @GuilhermeSantos001
 * @update 26/07/2021
 * @version 2.0.0
 */

import indexedDB from './IndexedDB_core';

export default class indexedDB_users extends indexedDB {
    constructor(db_name = 'user', version = 1) {
        super(db_name, version);
    };

    async setUserInfo(info) {
        const store = await this.storeGet('info', 'id', '0001');

        if (Object.keys(store).length <= 0) {
            return await this.storeAdd('info', 'id', Object.assign({ id: '0001' }, info));
        } else {
            return await this.storeUpdate('info', 'id', '0001', info);
        };
    };

    async getUserInfo() {
        return await this.storeGet('info', 'id', '0001');
    };

    async clearUserInfo() {
        return await this.storeClear('info', 'id');
    };
};