/**
 * Bcrypt
 * @description https://www.npmjs.com/package/bcrypt
 * @author GuilhermeSantos001
 * @update 17/07/2021
 * @version 1.0.0
 */

import { genSalt, hash, compare } from 'bcrypt';

export function Encrypt(password: string, saltRounds?: number) {
    return new Promise<string>((resolve, reject) => {
        genSalt(saltRounds || 10, function (err: any, salt: string) {
            if (err)
                return reject(err);

            hash(password, salt, function (err: any, encrypted: string) {
                if (err)
                    return reject(err);

                return resolve(encrypted);
            });
        });
    });
};

export function Decrypt(password: string, encrypted: string) {
    return new Promise<boolean>((resolve, reject) => {
        compare(password, encrypted, function (err, same) {
            if (err) return reject(err);

            return resolve(same);
        });
    });
};