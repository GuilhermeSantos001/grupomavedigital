(function () {
    'use strict';

    // ======================================================================
    // Import of Globals(APP)
    //
    window.app = window.app || {};

    // ======================================================================
    // indexedDB
    //  Class for Storange Web
    //
    function indexedDB() {
        this.initialize.apply(this, arguments);
    }

    indexedDB.prototype.initialize = function (db_name = 'default', version = 1) {
        if (!this.supportBrowser())
            throw new Error('Browser not support for indexedDB!');

        this.db = db_name;
        this.version = version;
    };

    indexedDB.prototype.supportBrowser = function () {
        const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

        if (Modernizr) {
            return Modernizr.localstorage;
        }

        return indexedDB;
    };

    indexedDB.prototype.storeGet = function (storeName = 'main', keyPath = 'id', key = '0001') {
        return new Promise((resolve, reject) => {
            let request_DB = window.indexedDB.open(this.db, this.version);

            request_DB.onerror = function (event) {
                reject({
                    msg: 'Error when opening the database',
                    error: event
                });
            };

            request_DB.onupgradeneeded = function (event) {
                event.target.result.createObjectStore(storeName, { keyPath });
            };

            request_DB.onsuccess = function (event) {
                let db = event.target.result,
                    transaction = db.transaction([storeName], "readwrite"),
                    objectStore = transaction.objectStore(storeName),
                    request = objectStore.get(key);

                request.onsuccess = function (event) {
                    resolve(request.result || {});
                };

                transaction.onerror = function (event) {
                    reject({
                        msg: 'Error when trying to access the ObjectStore.',
                        error: event
                    });
                };

                request.onerror = function (event) {
                    reject({
                        msg: 'Error when trying to access the ObjectStore.',
                        error: event
                    });
                };
            };
        });
    };

    indexedDB.prototype.storeAdd = function (storeName = 'main', keyPath = 'id', data = { id: '0001' }) {
        return new Promise((resolve, reject) => {
            let request_DB = window.indexedDB.open(this.db, this.version);

            request_DB.onerror = function (event) {
                reject({
                    msg: 'Error when opening the database',
                    error: event
                });
            };

            request_DB.onupgradeneeded = function (event) {
                event.target.result.createObjectStore(storeName, { keyPath });
            };

            request_DB.onsuccess = function (event) {
                let db = event.target.result,
                    transaction = db.transaction([storeName], "readwrite"),
                    objectStore = transaction.objectStore(storeName);

                transaction.oncomplete = function (event) {
                    resolve('Successfully stored data');
                };

                transaction.onerror = function (event) {
                    reject({
                        msg: 'Error when trying to access the ObjectStore.',
                        error: event
                    });
                };

                objectStore.add(data);
            };
        });
    };

    indexedDB.prototype.storeRemove = function (storeName = 'main', keyPath = 'id', key = '0001') {
        return new Promise((resolve, reject) => {
            let request_DB = window.indexedDB.open(this.db, this.version);

            request_DB.onerror = function (event) {
                reject({
                    msg: 'Error when opening the database',
                    error: event
                });
            };

            request_DB.onupgradeneeded = function (event) {
                event.target.result.createObjectStore(storeName, { keyPath });
            };

            request_DB.onsuccess = function (event) {
                let db = event.target.result,
                    transaction = db.transaction([storeName], "readwrite"),
                    objectStore = transaction.objectStore(storeName);

                transaction.oncomplete = function (event) {
                    resolve('ObjectStore successfully removed');
                };

                transaction.onerror = function (event) {
                    reject({
                        msg: 'Error when trying to access the ObjectStore.',
                        error: event
                    });
                };

                objectStore.delete(key);
            };
        });
    };

    indexedDB.prototype.storeUpdate = function (storeName = 'main', keyPath = 'id', key = '0001', newData = {}) {
        return new Promise((resolve, reject) => {
            let request_DB = window.indexedDB.open(this.db, this.version);

            request_DB.onerror = function (event) {
                reject({
                    msg: 'Error when opening the database',
                    error: event
                });
            };

            request_DB.onupgradeneeded = function (event) {
                event.target.result.createObjectStore(storeName, { keyPath });
            };

            request_DB.onsuccess = function (event) {
                let db = event.target.result,
                    transaction = db.transaction([storeName], "readwrite"),
                    objectStore = transaction.objectStore(storeName),
                    request = objectStore.get(key);

                transaction.oncomplete = function (event) {
                    resolve('ObjectStore successfully updated');
                };

                transaction.onerror = function (event) {
                    reject({
                        msg: 'Error when trying to access the ObjectStore.',
                        error: event
                    });
                };

                request.onsuccess = function (event) {
                    let result = request.result || {};
                    objectStore.put(Object.assign(result, newData));
                };

                request.onerror = function (event) {
                    reject({
                        msg: 'Error when trying to access the ObjectStore.',
                        error: event
                    });
                };
            };
        });
    };

    indexedDB.prototype.storeClear = function (storeName = 'main', keyPath = 'id') {
        return new Promise((resolve, reject) => {
            let request_DB = window.indexedDB.open(this.db, this.version);

            request_DB.onerror = function (event) {
                reject({
                    msg: 'Error when opening the database',
                    error: event
                });
            };

            request_DB.onupgradeneeded = function (event) {
                event.target.result.createObjectStore(storeName, { keyPath });
            };

            request_DB.onsuccess = function (event) {
                let db = event.target.result,
                    transaction = db.transaction([storeName], "readwrite"),
                    objectStore = transaction.objectStore(storeName);

                transaction.oncomplete = function (event) {
                    resolve('ObjectStore successfully clear');
                };

                transaction.onerror = function (event) {
                    reject({
                        msg: 'Error when trying to access the ObjectStore.',
                        error: event
                    });
                };

                objectStore.clear();
            };
        });
    };

    // ======================================================================
    // Export to Globals(APP)
    //
    window.app['indexedDB'] = indexedDB;
})();