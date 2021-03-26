const log4js = require("log4js"),
    path = (() => {
        const localpath = require('./localpath');

        if (!localpath.localPathExists('graphql-server/log'))
            localpath.localPathCreate('graphql-server/log')

        return localpath.localPath('graphql-server/log');
    })();

log4js.configure({
    appenders: {
        router_users_logs: {
            type: 'file',
            filename: `${path}/router_users.log`,
            maxLogSize: 100000,
            backups: 5,
            keepFileExt: true,
            compress: true
        },
        router_file_logs: {
            type: 'file',
            filename: `${path}/router_files.log`,
            maxLogSize: 100000,
            backups: 5,
            keepFileExt: true,
            compress: true
        },
        console: { type: 'console' }
    },
    categories: {
        router_users: { appenders: ['router_users_logs'], level: 'trace' },
        router_files: { appenders: ['router_file_logs'], level: 'trace' },
        default: {
            appenders: [
                'console',
                'router_users_logs',
                'router_file_logs'
            ], level: 'trace'
        }
    }
});

module.exports = {
    log: {
        router: {
            users: log4js.getLogger('router_users'),
            files: log4js.getLogger('router_files')
        }
    }
};