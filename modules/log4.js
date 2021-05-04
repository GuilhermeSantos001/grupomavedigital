const
    log4js = require("log4js"),
    path = (() => {
        const localpath = require('./localpath');

        if (!localpath.localPathExists('log'))
            localpath.localPathCreate('log')

        return localpath.localPath('log');
    })(),
    moment = require('./moment');


log4js.configure({
    appenders: {
        router_general_logs: {
            type: 'file',
            filename: `${path}/router_general.log`
        },
        router_users_logs: {
            type: 'file',
            filename: `${path}/router_users.log`
        },
        router_file_logs: {
            type: 'file',
            filename: `${path}/router_files.log`
        },
        router_hls_logs: {
            type: 'file',
            filename: `${path}/router_hls.log`
        },
        router_files_upload_logs: {
            type: 'file',
            filename: `${path}/router_files_upload.log`
        },
        console: { type: 'console' }
    },
    categories: {
        router_general: { appenders: ['router_general_logs'], level: 'trace' },
        router_users: { appenders: ['router_users_logs'], level: 'trace' },
        router_files: { appenders: ['router_file_logs'], level: 'trace' },
        router_hls: { appenders: ['router_hls_logs'], level: 'trace' },
        router_files_upload: { appenders: ['router_files_upload_logs'], level: 'trace' },
        default: { appenders: ['console'], level: 'trace' }
    }
});

/**
 * @class LOG
 * @author GuilhermeSantos001
 * @description Mecanismo de LOG em arquivos e imprimindo no console.
 * @static
 */
class LOG {
    constructor() {
        throw new Error('this is static class');
    }

    static isHomolog() {
        return process.env.NODE_ENV == "development";
    }

    static parseCategory(category) {
        switch (String(category).toLowerCase()) {
            case 'hls':
                return 'router_hls';
            case 'user':
                return 'router_users';
            case 'files_upload':
                return 'router_files_upload';
            default:
                return 'router_general';
        }
    }

    static exe(category) {
        return log4js.getLogger(category);
    }

    static working(category) {
        return this.exe(category);
    }

    static console(type, message, ...args) {
        if (this.isHomolog())
            console.log(`[${moment.format()}] ${type}`, message, ...args);
    }

    static log(category, message, ...args) {
        if (this.working(this.parseCategory(category)))
            this.exe(this.parseCategory(category)).log(message, args);

        this.console(`[LOG] ${String(category).toUpperCase()} -`, message, args);
    }

    static info(category, message, ...args) {
        if (this.working(this.parseCategory(category)))
            this.exe(this.parseCategory(category)).info(message, args);

        this.console(`[INFO] ${String(category).toUpperCase()} -`, message, args);
    }

    static warn(category, message, ...args) {
        if (this.working(this.parseCategory(category)))
            this.exe(this.parseCategory(category)).warn(message, args);

        this.console(`[WARN] ${String(category).toUpperCase()} -`, message, args);
    }

    static fatal(category, message, ...args) {
        if (this.working(this.parseCategory(category)))
            this.exe(this.parseCategory(category)).fatal(message, args);

        this.console(`[FATAL] ${String(category).toUpperCase()} -`, message, args);
    }
}

module.exports = LOG;