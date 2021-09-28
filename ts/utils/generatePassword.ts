/**
 * @description Gerador de senhas
 * @author @GuilhermeSantos001
 * @update 29/06/2021
 * @version 1.0.0
 */

import { generate, generateMultiple } from 'generate-password';

export default class Password {
    constructor() {
        throw new Error('this is static class');
    };

    static get options() {
        return {
            length: 20,
            numbers: true,
            symbols: true,
            lowercase: true,
            uppercase: true,
            excludeSimilarCharacters: false,
            exclude: '\+\_\-\=\}\{\[\]\(\)\|\:\;\"\/\?\>\<\,\`\^\~\'\}',
            strict: true
        };
    };

    /**
     * @description Gera uma única senha
     * @return {String}
     */
    static unique(): string {
        return generate(this.options);
    };

    /**
     * @description Gera uma serie de senhas únicas
     * @param {Number} amount - Quantidade de senhas a serem geradas.
     * @return {[String]}
     */
    static multiple(amount: number = 3): string[] {
        return generateMultiple(amount, this.options);
    };
};