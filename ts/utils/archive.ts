/**
 * @description Compilador de streams
 * @author GuilhermeSantos001
 * @update 27/08/2021
 * @version 1.2.0
 */

import archiver from 'archiver';
import { constants } from 'zlib';
import { Response } from 'express';
import { ReadStream, WriteStream } from 'fs';
import { GridFSBucketReadStream } from 'mongodb';

export interface Reader {
    stream: ReadStream | GridFSBucketReadStream,
    filename: string;
    version: string;
}

export default class Archive {
    constructor() {
        throw new TypeError('this is static class');
    }

    static base = archiver('zip', {
        zlib: { level: constants.Z_BEST_COMPRESSION }
    });

    /**
     * @description Obtém vários fluxos(ReadStreams) de arquivos e junta-os
     * na stream(WriteStream | Response) principal.
     */
    static joinWithReaders(stream: WriteStream | Response, readers: Reader[]): Promise<void> {
        return new Promise((resolve, reject) => {
            const archive = this.base;

            // Ouvir todos os dados do arquivo a serem gravados
            // 'close' evento é disparado apenas quando um descritor de arquivo está envolvido
            stream.on('close', function () {
                return resolve();
            });

            // Este evento é disparado quando a fonte de dados é drenada, não importa qual seja a fonte de dados.
            // Não faz parte desta biblioteca, mas sim da API NodeJS Stream.
            // @leia: https://nodejs.org/api/stream.html#stream_event_end
            stream.on('end', function () {
                return resolve();
            });

            // Boa prática para detectar avisos (ou seja, falhas de estatísticas e outros erros sem bloqueio)
            archive.on('warning', function (error) {
                return reject(error);
            });

            // Boa prática para detectar este erro explicitamente
            archive.on('error', function (error) {
                return reject(error);
            });

            // pipe arquivar dados para o arquivo
            archive.pipe(stream);

            // Anexar um arquivo do fluxo
            for (const reader of readers) {
                archive.append(reader.stream, { name: reader.filename, prefix: `version_${reader.version}` });
            }

            // Finalize o arquivo (ou seja, terminamos de anexar os arquivos, mas os fluxos ainda precisam terminar)
            // 'close', 'end' or 'finish' pode ser disparado logo após chamar este método, então registre-se neles com antecedência
            archive.finalize();
        });
    }
}