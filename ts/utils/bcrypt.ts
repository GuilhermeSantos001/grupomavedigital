/**
 * @description https://www.npmjs.com/package/bcrypt
 * @author GuilhermeSantos001
 * @update 29/09/2021
 */

import { genSalt, hash, compare } from 'bcrypt';

export function Encrypt(password: string, saltRounds?: number): Promise<string> {
    return new Promise((resolve, reject) => {
        genSalt(saltRounds || 10, function (error: Error | undefined, salt: string) {
            if (error)
                return reject(error);

            hash(password, salt, function (error: Error | undefined, encrypted: string) {
                if (error)
                    return reject(error);

                return resolve(encrypted);
            });
        });
    });
}

export function Decrypt(password: string, encrypted: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        compare(password, encrypted, function (error: Error | undefined, same: boolean) {
            if (error)
                return reject(error);

            return resolve(same);
        });
    });
}