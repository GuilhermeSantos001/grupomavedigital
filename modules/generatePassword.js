/**
 * @class Password
 * @author GuilhermeSantos001
 */

class Password {
    constructor() {
        throw new Error('this is static class');
    }

    static get generator() {
        return require('generate-password');
    }

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
        }
    }

    /**
     * @return {String}
     */
    static unique() {
        return this.generator.generate(this.options);
    }

    /**
     * @param {Number} amount - Quantidade de senhas a serem geradas.
     * @return {[String]}
     */
    static multiple(amount = 3) {
        return this.generator.generateMultiple(amount, this.options);
    }
}



module.exports = Password;