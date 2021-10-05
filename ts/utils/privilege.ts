/**
 * @class Manipulador dos privilégios do sistema
 * @author @GuilhermeSantos001
 * @update 29/09/2021
 */

import { PrivilegesSystem } from '@/mongo/user-manager-mongo';

export default class Privilege {
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
    }

    /**
     * TAGS *
     */
    static get TAG_COMMON(): string {
        return String('Common').trim().toLowerCase();
    }

    static get TAG_ADMIN(): string {
        return String('Administrador').trim().toLowerCase();
    }

    static get TAG_MODERATOR(): string {
        return String('Moderador').trim().toLowerCase();
    }

    static get TAG_SUPERVISOR(): string {
        return String('Supervisor').trim().toLowerCase();
    }

    /**
     * ALIAS *
     */

    static get ALIAS_COMMON(): string {
        return String('Membro').trim();
    }

    static get ALIAS_ADMIN(): string {
        return String('Guardião').trim();
    }

    static get ALIAS_MODERATOR(): string {
        return String('Moderador').trim();
    }

    static get ALIAS_SUPERVISOR(): string {
        return String('Supervisor').trim();
    }

    static get ALIAS_UNEXPECTED(): string {
        return String('Desconhecido').trim();
    }

    static check(args: Array<string>, values: Array<PrivilegesSystem>): boolean {
        return args.filter(arg =>
            values.map(value => value.trim().toLowerCase()).indexOf(arg) !== -1
        ).length > 0;
    }

    static alias(value: PrivilegesSystem): string {
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
        }
    }

    static pattern(values: Array<PrivilegesSystem>): boolean {
        return this.check([this.TAG_COMMON], values);
    }

    static admin(values: Array<PrivilegesSystem>): boolean {
        return this.check([this.TAG_ADMIN], values);
    }

    static staff(values: Array<PrivilegesSystem>): boolean {
        return this.check([this.TAG_ADMIN, this.TAG_MODERATOR], values);
    }
}