/**
 * @class Manipulador de datas
 * @author @GuilhermeSantos001
 * @update 29/09/2021
 */

import moment from 'moment';

declare interface Options {
    layout?: string;
    exclude?: string;
}

export default class Moment {

    constructor() {
        throw new Error('this is static class');
    }

    static get moment(): moment.Moment {
        return moment();
    }

    static format(options?: Options): string {
        if (!options?.exclude)
            return this.moment.format(options?.layout);
        else
            return this.moment.format(options?.layout).replace(options.exclude, ' || ');
    }
}