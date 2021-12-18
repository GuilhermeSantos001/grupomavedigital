/**
 * @class Manipulador de hora, data e formatação de datas
 * @author @GuilhermeSantos001
 * @update 17/11/2021
 */

import moment from 'moment';

declare interface Options {
    layout?: string;
    exclude?: string;
}

export default class Moment {

    constructor() {
        throw new TypeError('this is static class');
    }

    /**
     * @description Formata uma data para a localidade do sistema com as opções de layout e exclusão de algumas partes
     */
    static format(options?: Options): string {
        if (!options?.exclude)
            return moment().format(options?.layout);
        else
            return moment().format(options?.layout).replace(options.exclude, ' || ');
    }

    /**
     * @description Formata a data para o padrão Ano, Mês, Dia
     */
    static formatDate(date: string) {
        const
            year = date.substring(0, 4),
            month = date.substring(4, 6),
            day = date.substring(6, 8);

        const result = moment(`${year}-${month}-${day}`, 'YYYY-MM-DD');

        if (!result.isValid())
            return moment();

        return result;
    }
}