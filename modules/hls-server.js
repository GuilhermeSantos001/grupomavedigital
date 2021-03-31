const
    ffmpeg = require('../modules/ffmpeg');

class HLS_SERVER {
    constructor(server) {
        this.error = function (error) { throw new Error(error); };
        this.folderPath = 'public\\assets\\hls';
        this.define(server);
        ffmpeg.encode(
            `public/assets/teste.mp4`,
            {
                title: 'godzilla',
                resolution: "144p",
                caption: `WEBVTT \
                \n\n00:00:00.000 --> 00:00:03.000 \
                \n- [Locutor] Grupo Mave Apresenta... \
                \n\n00:00:02.000 --> 00:00:31.000 \
                \nThis is a subtitle`
            })
            .then(data => console.info(data))
            .catch(error => { throw new Error(error); })
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

                        if (ext !== 'm3u8' && ext !== 'ts') {
                            return cb(null, true);
                        }

                        fs.access(filePath, fs.constants.F_OK, function (err) {
                            if (err) {
                                onError('HLS - File not exist', filePath);
                                return cb(null, false);
                            }

                            cb(null, true);
                        });
                    },
                    getManifestStream: (req, cb) => {
                        const filePath = path.localPath(folderPath + '\\' + req.url);

                        fs.access(filePath, fs.constants.F_OK, function (err) {
                            if (err) {
                                onError('HLS - File not exist', filePath);
                                return cb(null, false);
                            }

                            cb(null, fs.createReadStream(filePath));
                        });
                    },
                    getSegmentStream: (req, cb) => {
                        const filePath = path.localPath(folderPath + '\\' + req.url);

                        fs.access(filePath, fs.constants.F_OK, function (err) {
                            if (err) {
                                onError('HLS - File not exist', filePath);
                                return cb(null, false);
                            }

                            cb(null, fs.createReadStream(filePath));
                        });
                    }
                }
            });
    }

    on(type, f) {
        switch (String(type).toLowerCase()) {
            case 'error':
                return this.error = f || function (error) { throw new Error(error); };
        }
    }
}

module.exports = (server) => new HLS_SERVER(server);