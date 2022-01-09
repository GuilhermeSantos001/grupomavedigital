/**
 * @description Debug
 * @author GuilhermeSantos001
 * @update 30/08/2021
 * @version 1.0.4
 */

import { configure, getLogger, Logger } from 'log4js';

import { localPath, localPathExists, localPathCreate } from '@/utils/localpath';
import Moment from '@/utils/moment';

const
    path = (() => {
        if (!localPathExists('log'))
            localPathCreate('log')

        return localPath('log');
    })();

configure({
    appenders: {
        router_general_logs: {
            type: 'file',
            filename: `${path}/router_general.log`
        },
        router_users_logs: {
            type: 'file',
            filename: `${path}/router_users.log`
        },
        router_mongodb_logs: {
            type: 'file',
            filename: `${path}/router_mongodb.log`
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
        jobs_logs: {
            type: 'file',
            filename: `${path}/jobs.log`
        },
        console: { type: 'console' }
    },
    categories: {
        router_general: { appenders: ['router_general_logs'], level: 'ALL' },
        router_users: { appenders: ['router_users_logs'], level: 'ALL' },
        router_files: { appenders: ['router_file_logs'], level: 'ALL' },
        router_hls: { appenders: ['router_hls_logs'], level: 'ALL' },
        router_files_upload: { appenders: ['router_files_upload_logs'], level: 'ALL' },
        database_mongoDB: { appenders: ['router_mongodb_logs'], level: 'ALL' },
        jobs: { appenders: ['jobs_logs'], level: 'ALL' },
        default: { appenders: ['console'], level: 'ALL' }
    }
});

declare type Category = 'default' | 'hls' | 'user' | 'mongoDB' | 'files_upload' | 'jobs';

export default class Debug {
    static isHomolog(): boolean {
        return process.env.NODE_ENV == "development";
    }

    static parseCategory(category: Category): string {
        switch (String(category).toLowerCase()) {
            case 'hls':
                return 'router_hls';
            case 'user':
                return 'router_users';
            case 'mongodb':
                return 'database_mongoDB';
            case 'files_upload':
                return 'router_files_upload';
            case 'jobs':
                return 'jobs';
            case 'default':
            default:
                return 'router_general';
        }
    }

    static exe(category: string): Logger {
        return getLogger(category);
    }

    static console(type: string, message: string, ...args: string[]): void {
        if (this.isHomolog())
            console.log(`[${Moment.format({ exclude: 'T', layout: 'DD/MM/YYYYTHH:mm:ss' })}] [${String(type).toUpperCase()}] -`, message, ...args);
    }

    static log(category: Category, message: string, ...args: string[]): void {
        this.exe(this.parseCategory(category)).debug(message, args.length > 0 ? args : "");
        this.console(`[${Moment.format({ exclude: 'T', layout: 'DD/MM/YYYYTHH:mm:ss' })}] [LOG] [${String(category).toUpperCase()}] -`, message, ...args);
    }

    static info(category: Category, message: string, ...args: string[]): void {
        this.exe(this.parseCategory(category)).info(message, args.length > 0 ? args : "");
        this.console(`[${Moment.format({ exclude: 'T', layout: 'DD/MM/YYYYTHH:mm:ss' })}] [INFO] [${String(category).toUpperCase()}] -`, message, ...args);
    }

    static warn(category: Category, message: string, ...args: string[]): void {
        this.exe(this.parseCategory(category)).warn(message, args.length > 0 ? args : "");
        this.console(`[${Moment.format({ exclude: 'T', layout: 'DD/MM/YYYYTHH:mm:ss' })}] [WARN] [${String(category).toUpperCase()}] -`, message, ...args);
    }

    static fatal(category: Category, message: string, ...args: string[]): void {
        this.exe(this.parseCategory(category)).fatal(message, args.length > 0 ? args : "");
        this.console(`[${Moment.format({ exclude: 'T', layout: 'DD/MM/YYYYTHH:mm:ss' })}] [FATAL] [${String(category).toUpperCase()}] -`, message, ...args);
    }
}