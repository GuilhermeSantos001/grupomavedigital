/**
 * @class Moment
 * @author GuilhermeSantos001
 */
class Moment {
    constructor() {
        throw new Error('this is static class');
    }

    static get moment() {
        return require('moment')();
    }

    static format() {
        return this.moment.format();
    }
}

module.exports = Moment;