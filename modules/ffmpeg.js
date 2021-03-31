const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const webvtt = require('node-webvtt');
const ThumbnailGenerator = require('webvtt-thumbnails-genetor');
const fs = require('fs');
const readline = require('readline');
const path = require('./localPath');
const randomId = require('./randomId');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

class FFMPEG {
    constructor() {
        this.pathbase = 'public/assets/hls';
    }

    normalizePath(...paths) {
        let __path = "";
        paths.forEach(_path => __path += '/' + _path);
        return this.pathbase + __path;
    }

    encode(filePath = "", options = {
        title: "",
        resolution: "720p",
        caption: `WEBVTT \
        \n\n00:00:00.000 --> 00:00:03.000 \
        \n- [Locutor] Linha de Exemplo... \
        \n\n00:00:02.000 --> 00:00:31.000 \
        \nEsse é um exemplo`
    }) {
        return new Promise((resolve, reject) => {
            if (fs.existsSync(filePath)) {
                let fileOutput = randomId("_video-", undefined, "hash", "godzilla"),
                    readfileOutput = this.normalizePath('videos', fileOutput, String(options.resolution.replace("p", "")));

                path.localPathCreate(this.normalizePath('videos', fileOutput));

                ffmpeg(filePath, { timeout: 432000 })
                    .addOptions(this.normalizeOptions(options))
                    .output(readfileOutput)
                    .on('end', () => {
                        const rl = readline.createInterface({
                            input: fs.createReadStream(readfileOutput),
                            output: process.stdout,
                            terminal: false
                        });

                        let newVttFile = '';

                        rl.on('line', (line) => {
                            if (line.length > 0) {
                                if (line.match(/\.ts/g))
                                    newVttFile += `/videos/${fileOutput}/${line}` + '\r\n';
                                else
                                    newVttFile += String(line) + '\r\n';
                            } else {
                                newVttFile += '\r\n';
                            }
                        });

                        rl.on('error', (error) => reject(error));

                        rl.on('close', () => {
                            fs.writeFile(readfileOutput + '.m3u8', Buffer.from(newVttFile), (error) => {
                                if (error)
                                    return reject(error);

                                const
                                    legendFileM3U8 = randomId(`_legend-${options.title}-m3u8-`, undefined, 'hash', options.title),
                                    legendFileVTT = randomId(`_legend-${options.title}-vtt-`, undefined, 'hash', options.title),
                                    thumbsFileM3U8 = randomId(`_thumbs-${options.title}-`, undefined, 'hash', options.title)

                                this.writeCaption(
                                    options.caption,
                                    legendFileM3U8,
                                    legendFileVTT
                                )
                                    .then(() => {
                                        this.generateThumbs({
                                            src: filePath,
                                            output: thumbsFileM3U8
                                        })
                                            .then(() => {
                                                this.getMasterFile(
                                                    title = "godzilla-trailer-2021",
                                                    vMaster = {
                                                        "144p": {
                                                            enabled: false,
                                                            bandwidth: "100000",
                                                            size: "256X144"
                                                        }
                                                    },
                                                    cFile = {
                                                        "portuguese": { language: 'pt', name: "Português-BR", file: '/captions/' }
                                                    })

                                                return resolve({
                                                    video: path.localPath(this.normalizePath('videos', fileOutput)),
                                                    caption: cFile,
                                                    thumbs: tFile
                                                })
                                            })
                                            .catch(error => reject(error))
                                    })
                                    .catch(error => reject(error))
                            });
                        });
                    })
                    .on('error', (error) => reject(error))
                    .run();
            } else {
                return reject(`File ${filePath} no exist!`);
            }
        });
    }

    normalizeOptions(options) {
        switch (String(options['resolution']).toLowerCase()) {
            case '8k':
                return [
                    '-profile:v baseline',
                    '-level 3.0',
                    '-s 7680X4320',
                    '-start_number 0',
                    '-hls_time 10',
                    '-hls_list_size 0',
                    '-f hls'
                ];
            case '4k':
                return [
                    '-profile:v baseline',
                    '-level 3.0',
                    '-s 3840X2160',
                    '-start_number 0',
                    '-hls_time 10',
                    '-hls_list_size 0',
                    '-f hls'
                ];
            case '1080p':
                return [
                    '-profile:v baseline',
                    '-level 3.0',
                    '-s 1920X1080',
                    '-start_number 0',
                    '-hls_time 10',
                    '-hls_list_size 0',
                    '-f hls'
                ];
            case '480p':
                return [
                    '-profile:v baseline',
                    '-level 3.0',
                    '-s 720X480',
                    '-start_number 0',
                    '-hls_time 10',
                    '-hls_list_size 0',
                    '-f hls'
                ];
            case '360p':
                return [
                    '-profile:v baseline',
                    '-level 3.0',
                    '-s 640X360',
                    '-start_number 0',
                    '-hls_time 10',
                    '-hls_list_size 0',
                    '-f hls'
                ];
            case '240p':
                return [
                    '-profile:v baseline',
                    '-level 3.0',
                    '-s 426X240',
                    '-start_number 0',
                    '-hls_time 10',
                    '-hls_list_size 0',
                    '-f hls'
                ];
            case '144p':
                return [
                    '-profile:v baseline',
                    '-level 3.0',
                    '-s 256X144',
                    '-start_number 0',
                    '-hls_time 10',
                    '-hls_list_size 0',
                    '-f hls'
                ];
            case '720p':
            default:
                return [
                    '-profile:v baseline',
                    '-level 3.0',
                    '-s 1280X720',
                    '-start_number 0',
                    '-hls_time 10',
                    '-hls_list_size 0',
                    '-f hls'
                ];
        }
    }

    getMasterFile(
        title = "",
        vMaster = {
            "8k": {
                enabled: false,
                bandwidth: "40000000",
                size: "7680X4320"
            },
            "4k": {
                enabled: false,
                bandwidth: "20000000",
                size: "3840X2160"
            },
            "1080p": {
                enabled: false,
                bandwidth: "5000000",
                size: "1920X1080"
            },
            "480p": {
                enabled: false,
                bandwidth: "500000",
                size: "720X480"
            },
            "360p": {
                enabled: false,
                bandwidth: "400000",
                size: "640X360"
            },
            "240p": {
                enabled: false,
                bandwidth: "300000",
                size: "426X240"
            },
            "144p": {
                enabled: false,
                bandwidth: "100000",
                size: "256X144"
            },
            "720p": {
                enabled: false,
                bandwidth: "2000000",
                size: "1280X720"
            }
        },
        cFile = {
            "portuguese": { language: 'pt', name: "Português-BR", file: "" },
            "english": { language: 'en', name: "Inglês", file: "" },
            "spanish": { language: 'es', name: "Espanhol", file: "" }
        }) {
        return new Promise((resolve, reject) => {
            let fileMaster = '#EXTM3U';

            Object
                .keys(vMaster)
                .forEach(resolution => {
                    if (vMaster[resolution]['enabled'])
                        fileMaster += `\n#EXT-X-STREAM-INF:BANDWIDTH=${vMaster[resolution]['bandwidth']},RESOLUTION=${vMaster[resolution]['size']},SUBTITLES="text"`;
                })

            Object
                .keys(cFile)
                .forEach((key, index) => {
                    if (cFile[key]['file'].length > 0)
                        fileMaster += `\n#EXT-X-MEDIA:TYPE=SUBTITLES,URI="${cFile[key]['file']}",GROUP-ID="text",LANGUAGE="${cFile[key]['language']}",NAME="${cFile[key]['name']}",AUTOSELECT=${index <= 0 ? 'YES' : 'NO'}`;
                })

            const fileM3U8 = path.localPath(this.pathbase) + `${title}.m3u8`;
            fs.writeFile(fileM3U8, Buffer.from(fileMaster), (error) => {
                if (error)
                    return reject(error);
                return resolve(fileM3U8);
            });
        });
    }

    writeCaption(input, masterFile, captionFile) {
        return new Promise((resolve, reject) => {
            try {
                let playlist = webvtt.hls.hlsSegmentPlaylist(input, 10);
                playlist = playlist.replace("0.vtt", `${captionFile}.vtt`);
                path.localPathCreate(this.normalizePath('captions', masterFile));

                let captionFileM3U8 = path.localPath(this.normalizePath('captions', masterFile, `${masterFile}.m3u8`)),
                    captionFileVTT = path.localPath(this.normalizePath('captions', masterFile, `${captionFile}.vtt`));

                fs.writeFileSync(captionFileM3U8, Buffer.from(playlist));
                fs.writeFileSync(captionFileVTT, Buffer.from(input));

                return resolve(captionFileM3U8);
            } catch (error) {
                return reject(error);
            }
        })
    }

    generateThumbs(filePath = { src: "", output: "" }) {
        return new Promise((resolve, reject) => {
            try {
                const
                    context = this,
                    normalizePath = context.normalizePath;

                ThumbnailGenerator(
                    path.localPath(filePath.src),
                    {
                        secondsPerThumbnail: 5,
                        outputDirectory: normalizePath.call(context, 'thumbs', filePath.output),
                        outputFileName: 'thumb'
                    },
                    function (_data) {
                        const vttFile = path.localPath(normalizePath.call(context, 'thumbs', filePath.output)) + '\\' + 'thumb.vtt';
                        path.localPathCreate(normalizePath.call(context, 'thumbs', filePath.output));

                        if (fs.existsSync(vttFile)) {
                            const rl = readline.createInterface({
                                input: fs.createReadStream(vttFile),
                                output: process.stdout,
                                terminal: false
                            });

                            let newVttFile = '';

                            rl.on('line', (line) => {
                                if (line.length > 0) {
                                    if (line.match(/\.png/g))
                                        newVttFile += `/thumbs/${filePath.output}/` + String(line.slice(line.lastIndexOf('\\')).match(/\d/g).join('')) + '.png' + '\r\n';
                                    else
                                        newVttFile += String(line) + '\r\n';
                                } else {
                                    newVttFile += '\r\n';
                                }
                            });

                            rl.on('error', (error) => reject(error));

                            rl.on('close', () => {
                                fs.writeFileSync(vttFile, Buffer.from(newVttFile));
                                return resolve(vttFile);
                            });
                        }
                    }
                );
            } catch (error) {
                return reject(error);
            }
        })
    }
}

module.exports = new FFMPEG();