(function () {
    'use strict';

    // ======================================================================
    // Import of Globals(APP)
    //
    window.app = window.app || {};
    const indexedDB = window.app['indexedDB'];

    // ======================================================================
    // indexedDB_users
    //  Class for Storange Web (Users)
    //
    function indexedDB_users() {
        this.initialize.apply(this, arguments);
    }

    indexedDB_users.prototype = Object.create(indexedDB.prototype);
    indexedDB_users.prototype.constructor = indexedDB_users;

    indexedDB_users.prototype.initialize = function (db_name = 'user', version = 1) {
        indexedDB.prototype.initialize.call(this, db_name, version);
    };

    indexedDB_users.prototype.getUserInfo = async function () {
        return await this.storeGet('info', 'id', '0001');
    };

    indexedDB_users.prototype.clearUserInfo = async function () {
        return await this.storeClear('info', 'id');
    };

    indexedDB_users.prototype.setUserInfo = async function (info) {
        let store = await this.storeGet('info', 'id', '0001');
        if (Object.keys(store).length <= 0) {
            return await this.storeAdd('info', 'id', Object.assign({ id: '0001' }, info));
        } else {
            return await this.storeUpdate('info', 'id', '0001', info);
        }
    };

    // ======================================================================
    // Export to Globals(APP)
    //
    window.app['indexedDB_users'] = new indexedDB_users('user', 1);
})();