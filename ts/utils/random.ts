/**
 * @description Geração aleatória de utilidades variadas
 * @author GuilhermeSantos001
 * @update 11/01/2022
 */

import { v4 as uuidv4 } from 'uuid';

import { createHash } from 'crypto';

export default class Random {
    constructor() {
        throw new TypeError('this is static class');
    }

    static INT(max: number): number {
        return Math.floor(max * Math.random());
    }

    static HASH(length: number, digest: 'base64' | 'base64url' | 'hex'): string {
        const hash = createHash('sha256');

        hash.update(this.STRING(length));

        return hash.digest(digest).substring(0, length);
    }

    static UUID(length: number, digest: 'base64' | 'base64url' | 'hex'): string {
        const hash = createHash('sha256');

        hash.update(uuidv4().replace(/\s{1,}/g, ''));

        return hash.digest(digest).substring(0, length).replace('.', '');
    }

    static STRING(length: number): string {
        const
            abc = [
                "a", "b", "c",
                "d", "e", "f",
                "g", "h", "i",
                "j", "k", "l",
                "m", "n", "o",
                "p", "q", "r",
                "s", "t", "u",
                "v", "w", "y",
                "z"
            ],
            nums = [
                1, 2, 3,
                4, 5, 6,
                7, 8, 9,
                0
            ],
            specials = [
                "_", "$", "@",
                "*", "#", "!",
                "-", "="
            ],
            abc_length = abc.length - 1,
            nums_length = nums.length - 1,
            specials_length = specials.length - 1;

        let iv = "";

        while (iv.length < length) {
            const cif = Random.INT(3);
            const uppercase = Random.INT(2);

            if (cif == 0) {
                if (uppercase)
                    iv += abc[Random.INT(abc_length)].toUpperCase();
                else
                    iv += abc[Random.INT(abc_length)].toLowerCase();
            } else if (cif == 1) {
                iv += nums[Random.INT(nums_length)];
            } else if (cif == 2) {
                iv += specials[Random.INT(specials_length)];
            }
        }

        return iv;
    }
}