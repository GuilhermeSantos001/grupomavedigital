/**
 * @description Classe usada para interação com indexedDB
 * @author @GuilhermeSantos001
 * @update 04/08/2021
 * @version 1.0.0
 */

export default class indexedDB {
    private readonly db: string;
    private readonly version: number;

    constructor(db_name: string = 'default', version: number = 1) {
        if (!this.supportBrowser())
            throw new Error('Browser not support for indexedDB!');

        this.db = db_name;
        this.version = version;
    };

    /**
     * @description Verifica se o browser tem suporte a indexedDB
     */
    supportBrowser(): IDBFactory {
        return window.indexedDB;
    };

    /**
     * @description Adiciona um novo valor há store
     */
    storeAdd(storeName: string = 'main', keyPath: string = 'id', data: any = { id: '0001' }) {
        return new Promise<boolean>((resolve, reject) => {
            let request_DB = window.indexedDB.open(this.db, this.version);

            request_DB.onerror = function () {
                return reject('Error when opening the database');
            };

            request_DB.onupgradeneeded = function (event) {
                const target: any = event.target;

                target.result.createObjectStore(storeName, { keyPath });
            };

            request_DB.onsuccess = function (event) {
                const target: any = event.target,
                    db = target.result,
                    transaction = db.transaction([storeName], "readwrite"),
                    objectStore = transaction.objectStore(storeName);

                transaction.onerror = function () {
                    return resolve(false);
                };

                const request = objectStore.add(data);

                request.onerror = function () {
                    return resolve(false);
                };

                request.onsuccess = function () {
                    return resolve(true);
                };
            };
        });
    };

    /**
     * @description Atualiza um valor na store
     */
    storeUpdate(storeName: string = 'main', keyPath: string = 'id', key: string = '0001', newData: object = {}) {
        return new Promise<boolean>((resolve, reject) => {
            let request_DB = window.indexedDB.open(this.db, this.version);

            request_DB.onerror = function () {
                return reject('Error when opening the database');
            };

            request_DB.onupgradeneeded = function (event) {
                const target: any = event.target;

                target.result.createObjectStore(storeName, { keyPath });
            };

            request_DB.onsuccess = function (event) {
                let
                    target: any = event.target,
                    db = target.result,
                    transaction = db.transaction([storeName], "readwrite"),
                    objectStore = transaction.objectStore(storeName);

                transaction.onerror = function () {
                    return resolve(false);
                };

                const request = objectStore.get(key);

                request.onerror = function () {
                    return resolve(false);
                };

                request.onsuccess = function () {
                    const result = request.result || {};

                    const update = objectStore.put(Object.assign(result, newData));

                    update.onsuccess = function () {
                        return resolve(true);
                    };

                    update.onerror = function () {
                        return resolve(false);
                    };
                };
            };
        });
    };

    /**
     * @description Retorna um valor da store
     */
    storeGet(storeName: string = 'main', keyPath: string = 'id', key: string = '0001') {
        return new Promise<object>((resolve, reject) => {
            let request_DB = window.indexedDB.open(this.db, this.version);

            request_DB.onerror = function () {
                reject('Error when opening the database');
            };

            request_DB.onupgradeneeded = function (event) {
                const target: any = event.target;

                target.result.createObjectStore(storeName, { keyPath });
            };

            request_DB.onsuccess = function (event) {
                const target: any = event.target,
                    db = target.result,
                    transaction = db.transaction([storeName], "readwrite"),
                    objectStore = transaction.objectStore(storeName);

                transaction.onerror = function () {
                    return reject('Transaction not opened due to error. Duplicate items not allowed.');
                };

                const request = objectStore.get(key);

                request.onsuccess = function () {
                    return resolve(request.result || {});
                };

                request.onerror = function () {
                    return reject('Error when trying to access the ObjectStore.');
                };
            };
        });
    };

    /**
     * @description Retorna todos os valores da store
     */
    storeGetAll(storeName: string = 'main', keyPath: string = 'id') {
        return new Promise<Array<object>>((resolve, reject) => {
            let request_DB = window.indexedDB.open(this.db, this.version);

            request_DB.onerror = function () {
                reject('Error when opening the database');
            };

            request_DB.onupgradeneeded = function (event) {
                const target: any = event.target;

                target.result.createObjectStore(storeName, { keyPath });
            };

            request_DB.onsuccess = function (event) {
                const target: any = event.target,
                    db = target.result,
                    transaction = db.transaction([storeName], "readwrite"),
                    objectStore = transaction.objectStore(storeName);

                transaction.onerror = function () {
                    return reject('Transaction not opened due to error. Duplicate items not allowed.');
                };

                const request = objectStore.getAll();

                request.onsuccess = function () {
                    return resolve(request.result || []);
                };

                request.onerror = function () {
                    return reject('Error when trying to access the ObjectStore.');
                };
            };
        });
    };

    /**
     * @description Remove um valor da store
     */
    storeRemove(storeName: string = 'main', keyPath: string = 'id', key: string = '0001') {
        return new Promise<boolean>((resolve, reject) => {
            let request_DB = window.indexedDB.open(this.db, this.version);

            request_DB.onerror = function () {
                return reject('Error when opening the database');
            };

            request_DB.onupgradeneeded = function (event) {
                const target: any = event.target;

                target.result.createObjectStore(storeName, { keyPath });
            };

            request_DB.onsuccess = function (event) {
                const
                    target: any = event.target,
                    db = target.result,
                    transaction = db.transaction([storeName], "readwrite"),
                    objectStore = transaction.objectStore(storeName);

                transaction.onerror = function () {
                    return resolve(false);
                };

                const request = objectStore.delete(key);

                request.onerror = function () {
                    return resolve(false);
                };

                request.onsuccess = function () {
                    return resolve(true);
                };
            };
        });
    };

    /**
     * @description Limpa todos os valores da store
     */
    storeClear(storeName: string = 'main', keyPath: string = 'id') {
        return new Promise<boolean>((resolve, reject) => {
            let request_DB = window.indexedDB.open(this.db, this.version);

            request_DB.onerror = function () {
                return reject('Error when opening the database');
            };

            request_DB.onupgradeneeded = function (event) {
                const target: any = event.target;

                target.result.createObjectStore(storeName, { keyPath });
            };

            request_DB.onsuccess = function (event) {
                const target: any = event.target,
                    db = target.result,
                    transaction = db.transaction([storeName], "readwrite"),
                    objectStore = transaction.objectStore(storeName);

                transaction.onerror = function () {
                    return reject(false);
                };

                const request = objectStore.clear();

                request.onerror = function () {
                    return resolve(false);
                };

                request.onsuccess = function () {
                    return resolve(true);
                };
            };
        });
    };
};