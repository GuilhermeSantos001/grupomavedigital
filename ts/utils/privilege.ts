/**
 * @class Manipulador dos privilégios do sistema
 * @author @GuilhermeSantos001
 * @update 17/07/2021
 * @version 1.0.1
 */

import { PrivilegesSystem } from '@/mongo/user-manager-mongo';

export default class Privilege {
    constructor() { };

    /**
     * All *
     */

    static all(): PrivilegesSystem[] {
        return [
            'administrador',
            'supervisor',
            'moderador',
            'common'
        ];
    };

    /**
     * TAGS *
     */
    static get TAG_COMMON() {
        return String('Common').trim().toLowerCase();
    };

    static get TAG_ADMIN() {
        return String('Administrador').trim().toLowerCase();
    };

    static get TAG_MODERATOR() {
        return String('Moderador').trim().toLowerCase();
    };

    static get TAG_SUPERVISOR() {
        return String('Supervisor').trim().toLowerCase();
    };

    /**
     * ALIAS *
     */

    static get ALIAS_COMMON() {
        return String('Membro').trim();
    };

    static get ALIAS_ADMIN() {
        return String('Guardião').trim();
    };

    static get ALIAS_MODERATOR() {
        return String('Moderador').trim();
    };

    static get ALIAS_SUPERVISOR() {
        return String('Supervisor').trim();
    };

    static get ALIAS_UNEXPECTED() {
        return String('Desconhecido').trim();
    };

    static check(args: Array<string>, values: Array<PrivilegesSystem>) {
        return args.filter(arg =>
            values.map(value => value.trim().toLowerCase()).indexOf(arg) !== -1
        ).length > 0;
    };

    static alias(value: PrivilegesSystem) {
        switch (value.toLowerCase()) {
            case this.TAG_COMMON:
                return this.ALIAS_COMMON;
            case this.TAG_ADMIN:
                return this.ALIAS_ADMIN;
            case this.TAG_MODERATOR:
                return this.ALIAS_MODERATOR;
            case this.TAG_SUPERVISOR:
                return this.ALIAS_SUPERVISOR;
            default:
                return this.ALIAS_UNEXPECTED;
        };
    };

    static pattern(values: Array<PrivilegesSystem>) {
        return this.check([this.TAG_COMMON], values);
    };

    static admin(values: Array<PrivilegesSystem>) {
        return this.check([this.TAG_ADMIN], values);
    };

    static staff(values: Array<PrivilegesSystem>) {
        return this.check([this.TAG_ADMIN, this.TAG_MODERATOR], values);
    };
};