/**
 * @description Gerador de senhas
 * @author @GuilhermeSantos001
 * @update 02/12/2021
 */

import { generate, generateMultiple } from 'generate-password';

export default class Password {
    constructor() {
        throw new TypeError('this is static class');
    }

    /**
     * @description Gera uma única senha
     * @return {String}
     */
    static unique(): string {
        return generate();
    }

    /**
     * @description Gera uma serie de senhas únicas
     * @param {Number} amount - Quantidade de senhas a serem geradas.
     * @return {[String]}
     */
    static multiple(amount = 3): string[] {
        return generateMultiple(amount, {
            length: 20,
            numbers: true,
            symbols: true,
            lowercase: true,
            uppercase: true,
            excludeSimilarCharacters: false,
            exclude: '+_-=}{[]()|:;"/?><,`^~\'}',
            strict: true
        });
    }
}