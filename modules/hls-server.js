const ffmpeg = require('./ffmpeg');
class HLS_SERVER {
    constructor(server) {
        this.folderPath = 'public\\assets\\hls';
        this.error = function (error) { throw new Error(error); };
        this.define(server);
    }

    define(server) {
        const hls = require('hls-server'),
            fs = require('fs'),
            path = require('../modules/localPath'),
            folderPath = this.folderPath,
            onError = this.error;

        this.server =
            new hls(server, {
                provider: {
                    exists: (req, cb) => {
                        const ext = req.url.split('.').pop(),
                            filePath = path.localPath(folderPath + '\\' + req.url);

                        if (ext !== 'm3u8' && ext !== 'ts' && ext !== '.vtt') {
                            return cb(null, true);
                        }

                        fs.access(filePath, fs.constants.F_OK, function (err) {
                            if (err) {
                                onError('HLS - File not exist');
                                return cb(null, false);
                            }

                            cb(null, true);
                        });
                    },
                    getManifestStream: (req, cb) => {
                        const filePath = path.localPath(folderPath + '\\' + req.url);

                        fs.access(filePath, fs.constants.F_OK, function (err) {
                            if (err) {
                                onError('HLS - File not exist');
                                return cb(null, false);
                            }

                            cb(null, fs.createReadStream(filePath));
                        });
                    },
                    getSegmentStream: (req, cb) => {
                        const filePath = path.localPath(folderPath + '\\' + req.url);

                        fs.access(filePath, fs.constants.F_OK, function (err) {
                            if (err) {
                                onError('HLS - File not exist');
                                return cb(null, false);
                            }

                            cb(null, fs.createReadStream(filePath));
                        });
                    }
                }
            });
    }
}

module.exports = (server) => new HLS_SERVER(server);