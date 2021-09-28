/**
 * MongoDB
 * @description Controlador de conexões com o MongoDB
 * @author GuilhermeSantos001
 * @update 01/09/2021
 * @version 1.4.1
 */
import { connection, connect } from 'mongoose';

import Debug from '@/core/log4';

interface User {
    username: string;
    password: string;
};

interface Config extends User {
    host: string;
    port: string;
    database: string;
};

/**
 * @description Configuração de acesso do mongodb
 */
const mongoConfig: Config = {
    username: process.env.DB_USERNAME || "",
    password: process.env.DB_PASSWORD || "",
    host: process.env.DB_HOST || "",
    port: process.env.DB_PORT || "27017",
    database: process.env.DB_NAME || ""
};

/**
 * @description Se a conexão for estabelecida
 */
connection.on('connected', function () {
    Debug.info('mongoDB', `The connection to mongoDB was established!`);
});

/**
 * @description Se o correr erros com a conexão
 */
connection.on('error', function (err) {
    Debug.fatal('mongoDB', `The connection to mongoDB had an error ${err}`);
});

/**
 * @description Quando a conexão é desconectada
 */
connection.on('disconnected', function () {
    Debug.info('mongoDB', `The connection to mongoDB was closed`);
});

/**
 * @description Quando a conexão está aberta
 */
connection.on('open', function () {
    Debug.info('mongoDB', `The connection to mongoDB has been opened`);
});

/**
 * @description Se o aplicativo fechar, feche a conexão
 */

function ConnectionClose(): void {
    connection.close(function (error) {
        if (error) {
            return Debug.info('mongoDB', `MongoDB got an error while trying to close the connection`, JSON.stringify(error));
        };

        if (connection.readyState == 0) {
            Debug.info('mongoDB', `Connection to mongoDB was closed, due to server shutdown`);
        };

        process.exit(0);
    });
};

process.on('SIGINT', ConnectionClose.bind(this));
process.on('SIGTERM', ConnectionClose.bind(this));

class MongoDB {
    constructor() {
        this.open();
    };

    private uri() {
        return `mongodb://${mongoConfig.username}:${encodeURIComponent(mongoConfig.password)}@${mongoConfig.host}:${mongoConfig.port}/${mongoConfig.database}?authSource=admin&readPreference=primary&appname=GMD&directConnection=true&ssl=false`;
    };

    private open() {
        connect(this.uri(), {
            autoIndex: true,
            autoCreate: true
        }, (err) => {
            if (err) {
                connection.close();

                Debug.info('mongoDB', `Error in try open connection for operations in database`);
            };

            Debug.info('mongoDB', `New Connection for operations in database`);
        });
    };

    public shutdown() {
        connection.close(function (error) {
            if (error) {
                return Debug.info('mongoDB', `MongoDB got an error while trying to close the connection`, JSON.stringify(error));
            };

            if (connection.readyState == 0) {
                Debug.info('mongoDB', `Connection to mongoDB was closed, due to server shutdown`);
            };
        });
    };

    public getDB(dbName: string) {
        return connection.getClient().db(dbName);
    };
};

export default new MongoDB();