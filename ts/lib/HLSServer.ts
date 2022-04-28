/**
 * @description Servidor de Streaming.
 * @author GuilhermeSantos001
 * @update 31/01/2022
 */

import { Server as HTTPServer } from 'http';
import { access, constants, createReadStream } from 'fs';

import { localPath } from '@/utils/localpath';
import { Debug } from '@/lib/Log4';

export class HLSServer {
    constructor(
        private server: HTTPServer,
        private folderPath: string
    ) {
        this.define();
    }

    private define() {
        const
            hls = require('hls-server'),
            folderPath = this.folderPath;

        this.server =
            new hls(this.server, {
                provider: {
                    exists: (req: any, callback: any) => {
                        const ext = req.url.split('.').pop(),
                            filePath = localPath(folderPath + '\\' + req.url);

                        if (ext !== 'm3u8' && ext !== 'ts' && ext !== '.vtt') {
                            return callback(null, true);
                        }

                        access(filePath, constants.F_OK, function (err) {
                            if (err) {
                                Debug.fatal('hls', `File not exist ${filePath}`, `IP-Request: ${req.connection.remoteAddress}`, `Class -> HLS_SERVER`, 'Method -> exists');

                                return callback(null, false);
                            }

                            callback(null, true);
                        });
                    },
                    getManifestStream: (req: any, callback: Function) => {
                        const filePath = localPath(folderPath + '\\' + req.url);

                        access(filePath, constants.F_OK, function (err) {
                            if (err) {
                                Debug.fatal('hls', `File not exist ${filePath}`, `IP-Request: ${req.connection.remoteAddress}`, `Class -> HLS_SERVER`, 'Method -> getManifestStream');

                                return callback(null, false);
                            }

                            callback(null, createReadStream(filePath));
                        });
                    },
                    getSegmentStream: (req: any, callback: Function) => {
                        const filePath = localPath(folderPath + '\\' + req.url);

                        access(filePath, constants.F_OK, function (err) {
                            if (err) {
                                Debug.fatal('hls', `File not exist ${filePath}`, `IP-Request: ${req.connection.remoteAddress}`, `Class -> HLS_SERVER`, 'Method -> getSegmentStream');

                                return callback(null, false);
                            }

                            callback(null, createReadStream(filePath));
                        });
                    }
                }
            });
    }
}

export function CreateHLSServer(server: HTTPServer) {
    return new HLSServer(server, 'public\\assets\\hls');
}