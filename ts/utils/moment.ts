/**
 * @class Manipulador de datas
 * @author @GuilhermeSantos001
 * @update 28/06/2021
 * @version 1.0.0
 */

import moment from 'moment';

declare interface Options {
    layout?: string;
    exclude?: string;
};

export default class Moment {

    constructor() {
        throw new Error('this is static class');
    };

    static get moment() {
        return moment();
    };

    static format(options?: Options): string {
        if (!options?.exclude)
            return this.moment.format(options?.layout);
        else
            return this.moment.format(options?.layout).replace(options.exclude, ' || ');
    };
};