class Privilege {
    constructor() { }

    /**
     * TAGS *
     */
    static get TAG_COMMUM() {
        return String('Commum').trim().toLowerCase();
    }

    static get TAG_ADMIN() {
        return String('Administrador').trim().toLowerCase();
    }

    static get TAG_MODERATOR() {
        return String('Moderador').trim().toLowerCase();
    }

    static get TAG_SUPERVISOR() {
        return String('Supervisor').trim().toLowerCase();
    }

    /**
     * ALIAS *
     */

    static get ALIAS_COMMUM() {
        return String('Membro').trim().toLowerCase();
    }

    static get ALIAS_ADMIN() {
        return String('Guardião').trim().toLowerCase();
    }

    static get ALIAS_MODERATOR() {
        return String('Moderador').trim().toLowerCase();
    }

    static get ALIAS_SUPERVISOR() {
        return String('Supervisor').trim().toLowerCase();
    }

    static get ALIAS_UNEXPECTED() {
        return String('Desconhecido').trim().toLowerCase();
    }

    static check(args, values) {
        return args.filter(arg =>
            values.map(value => value.trim().toLowerCase()).indexOf(arg) !== -1
        ).length > 0;
    }

    static alias(value) {
        switch (value) {
            case this.TAG_COMMUM:
                return this.ALIAS_COMMUM;
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


    static pattern(values) {
        return this.check([this.TAG_COMMUM], values);
    }

    static admin(values) {
        return this.check([this.TAG_ADMIN], values);
    }

    static staff(values) {
        return this.check([this.TAG_ADMIN, this.TAG_MODERATOR], values);
    }
}

module.exports = Privilege;