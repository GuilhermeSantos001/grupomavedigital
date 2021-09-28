/**
 * @description Controle dos dados dos usuários no navegador.
 * @author @GuilhermeSantos001
 * @update 26/07/2021
 * @version 2.0.0
 */

import indexedDB from './IndexedDB_core';

export default class indexedDB_cache extends indexedDB {
    constructor(db_name = 'cache', version = 1) {
        super(db_name, version);
    };

    async set(id, cache) {
        const store = await this.storeGet('cache', 'id', id);

        if (Object.keys(store).length <= 0) {
            return await this.storeAdd('cache', 'id', Object.assign({ id }, cache));
        } else {
            return await this.storeUpdate('cache', 'id', id, cache);
        };
    };

    async get(id) {
        return await this.storeGet('cache', 'id', id);
    };

    async clear() {
        return await this.storeClear('cache', 'id');
    };
};