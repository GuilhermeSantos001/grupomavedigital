/**
 * @author @GuilhermeSantos001
 * @description Controle de caminhos para pastas na aplicação
 * @update 17/07/2021
 * @version 1.0.0
 */

import { dirname, join, } from 'path';
import { existsSync, mkdirSync } from 'fs';

/**
 * @description Retorna o caminho local para o arquivo/pasta
 */
export function localPath(p: string): string {
    if (p.substring(0, 1) === '/') p = p.substring(1);

    const base = dirname(String(__dirname).replace(/\\ts\\|\\dist\\/, "\\"));

    return join(base, p);
};

/**
 * @description Verifica se o caminho local existe
 */
export function localPathExists(p: string): boolean {
    let i = 0,
        length = p.length,
        path = false,
        paths = [],
        pathString = '';

    for (; i < length; i++) {
        let letter = String(p[i]);
        if (letter != '/') {
            pathString += letter;
        }
        if (letter == '/' || i == length - 1) {
            paths.push(pathString);

            let pathsJoin = paths.join("/");

            if (existsSync(localPath(pathsJoin))) {
                path = true;
            } else {
                path = false;
            };

            pathString = '';
        };
    };

    return path;
};

/**
 * @description Cria o caminho local
 */
export function localPathCreate(p: string): void {
    let dir = '';

    p.split('/').map(path => {
        if (path.indexOf('.') == -1) {
            if (!localPathExists(dir += `${path}/`)) {
                mkdirSync(localPath(dir));
            };
        };
    });
};