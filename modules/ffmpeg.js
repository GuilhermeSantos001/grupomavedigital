const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const webvtt = require('node-webvtt');
const ThumbnailGenerator = require('webvtt-thumbnails-genetor');
const fs = require('fs');
const readline = require('readline');
const path = require('./localPath');
const randomId = require('./randomId');
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

/**
 * @class FFMPEG
 * @author GuilhermeSantos001
 * @description Usado para converter os videos em formato de streamer.
 */
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
        title: `Video-Now-${new Date().toISOString()}`,
        resolutions: [
            {
                key: "720p",
                enabled: true,
                bandwidth: "2000000",
                size: "1280X720"
            }
        ],
        caption: {
            portuguese: {
                input: `WEBVTT \
                \n\n00:00:00.000 --> 00:00:03.000 \
                \n- [Locutor] Grupo Mave Apresenta... \
                \n\n00:00:02.000 --> 00:00:31.000 \
                \nSou uma linha de texto`,
                language: 'pt',
                name: 'Português-BR'
            },
            english: {
                input: `WEBVTT \
                \n\n00:00:00.000 --> 00:00:03.000 \
                \n- [Announcer] Grupo Mave Presents... \
                \n\n00:00:02.000 --> 00:00:31.000 \
                \nI am a line of text`,
                language: 'en',
                name: 'Inglês'
            },
            spanish: {
                input: `WEBVTT \
                \n\n00:00:00.000 --> 00:00:03.000 \
                \n- [Altavoz] Grupo Mave presenta... \
                \n\n00:00:02.000 --> 00:00:31.000 \
                \nSoy una línea de texto`,
                language: 'es',
                name: 'Espanhol'
            }
        }
    }) {
        return new Promise((resolve, reject) => {
            if (fs.existsSync(filePath)) {
                try {
                    let memory = {},
                        _resolution = {},
                        maxResolutions = options.resolutions.length,
                        _indexResolution = 0;

                    options
                        .resolutions
                        .forEach(resolution => {
                            memory[`fileOutput_${resolution.key}`] = randomId("_video-", 10, "hash", options.title);
                            memory[`readfileOutput_${resolution.key}`] = this.normalizePath('videos', memory[`fileOutput_${resolution.key}`], String(resolution.key.replace("p", "")));
                            path.localPathCreate(this.normalizePath('videos', memory[`fileOutput_${resolution.key}`]));

                            ffmpeg(filePath, { timeout: 432000 })
                                .addOptions(this.getResolution(resolution.key))
                                .output(memory[`readfileOutput_${resolution.key}`])
                                .on('end', () => {
                                    const rl = readline.createInterface({
                                        input: fs.createReadStream(memory[`readfileOutput_${resolution.key}`]),
                                        output: process.stdout,
                                        terminal: false
                                    });

                                    let newVttFile = '';

                                    rl.on('line', (line) => {
                                        if (line.length > 0) {
                                            if (line.match(/\.ts/g))
                                                newVttFile += `/videos/${memory[`fileOutput_${resolution.key}`]}/${line}` + '\r\n';
                                            else
                                                newVttFile += String(line) + '\r\n';
                                        } else {
                                            newVttFile += '\r\n';
                                        }
                                    });

                                    rl.on('error', (error) => reject({ origin: `FFMPEG: Encode Video(${options.title}) Failed`, details: error }));

                                    rl.on('close', () => {
                                        fs.writeFile(memory[`readfileOutput_${resolution.key}`] + '.m3u8', Buffer.from(newVttFile), (error) => {
                                            if (error)
                                                return reject({ origin: `FFMPEG: Write File(${memory[`readfileOutput_${resolution.key}`] + '.m3u8'}) Failed`, details: error });

                                            _resolution[resolution.key] = {
                                                enabled: resolution.enabled,
                                                bandwidth: resolution.bandwidth,
                                                size: resolution.size,
                                                file: `/videos/${memory[`fileOutput_${resolution.key}`]}/${String(resolution.key.replace("p", ""))}.m3u8`
                                            }

                                            if (++_indexResolution >= maxResolutions) {
                                                const thumbsFileM3U8 = randomId(`_thumbs-${options.title}-`, 10, 'hash', options.title);

                                                this.generateThumbs({
                                                    src: filePath,
                                                    output: thumbsFileM3U8
                                                })
                                                    .then(thumbFile => {
                                                        let legendFileM3U8 = {},
                                                            legendFileVTT = {},
                                                            masterLegendFile = {},
                                                            indexProcess = 0,
                                                            lengthProcess = Object.keys(options.caption).length,
                                                            _languages = {};

                                                        Object.keys(options.caption)
                                                            .forEach(language => {
                                                                legendFileM3U8[language] = randomId(`_legend-${options.title}-m3u8-`, 10, 'hash', options.title);
                                                                legendFileVTT[language] = randomId(`_legend-${options.title}-vtt-`, 10, 'hash', options.title);

                                                                this.writeCaption(
                                                                    options.caption[language]['input'],
                                                                    legendFileM3U8[language],
                                                                    legendFileVTT[language]
                                                                )
                                                                    .then(fileCaption => {
                                                                        masterLegendFile[language] = fileCaption, indexProcess++;

                                                                        _languages[language] = {
                                                                            language: options.caption[language]['language'],
                                                                            name: options.caption[language]['name'],
                                                                            file: `/captions/${legendFileM3U8[language]}/${legendFileM3U8[language]}.m3u8`
                                                                        };

                                                                        if (indexProcess >= lengthProcess) {
                                                                            this.getMasterFile(
                                                                                options.title,
                                                                                _resolution,
                                                                                _languages
                                                                            )
                                                                                .then(masterFile => resolve({
                                                                                    masterFile,
                                                                                    legend: {
                                                                                        files_m3u8: legendFileM3U8,
                                                                                        files_vtt: legendFileVTT,
                                                                                        files_master: masterLegendFile,
                                                                                        total_languages: lengthProcess
                                                                                    },
                                                                                    video: memory,
                                                                                    thumbs: {
                                                                                        folder: thumbsFileM3U8,
                                                                                        file_master: thumbFile
                                                                                    }
                                                                                }))
                                                                                .catch(error => reject({ origin: `FFMPEG: Get File Master(${resolution.key}) Failed`, details: error }))
                                                                        }
                                                                    })
                                                                    .catch(error => reject({ origin: `FFMPEG: Write Captions(${resolution.key}) Failed`, details: error }))
                                                            })
                                                    })
                                                    .catch(error => reject({ origin: `FFMPEG: Generate Thumbs(${resolution.key}) Failed`, details: error }))
                                            }
                                        });
                                    });
                                })
                                .on('error', (error) => reject({ origin: `FFMPEG: Video Encode(${filePath}) Failed`, details: error }))
                                .run();
                        })
                } catch (error) {
                    return reject({ origin: `FFMPEG: Video Encode(${filePath}) Failed`, details: error });
                }
            } else {
                return reject(`File ${filePath} no exist!`);
            }
        });
    }

    getResolution(resolution) {
        switch (String(resolution).toLowerCase()) {
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
                bandwidth: String(Math.floor(7680 * 4320 * 30 * 4 * 0.07)),
                size: "7680X4320",
                file: ""
            },
            "4k": {
                enabled: false,
                bandwidth: String(Math.floor(3840 * 2160 * 30 * 4 * 0.07)),
                size: "3840X2160",
                file: ""
            },
            "1080p": {
                enabled: false,
                bandwidth: String(Math.floor(1920 * 1080 * 30 * 4 * 0.07)),
                size: "1920X1080",
                file: ""
            },
            "480p": {
                enabled: false,
                bandwidth: String(Math.floor(720 * 480 * 30 * 4 * 0.07)),
                size: "720X480",
                file: ""
            },
            "360p": {
                enabled: false,
                bandwidth: String(Math.floor(640 * 360 * 30 * 4 * 0.07)),
                size: "640X360",
                file: ""
            },
            "240p": {
                enabled: false,
                bandwidth: String(Math.floor(426 * 240 * 30 * 4 * 0.07)),
                size: "426X240",
                file: ""
            },
            "144p": {
                enabled: false,
                bandwidth: String(Math.floor(256 * 144 * 30 * 4 * 0.07)),
                size: "256X144",
                file: ""
            },
            "720p": {
                enabled: false,
                bandwidth: String(Math.floor(1280 * 720 * 30 * 4 * 0.07)),
                size: "1280X720",
                file: ""
            }
        },
        cFile = {
            "portuguese": { language: 'pt', name: "Português-BR", file: "" },
            "english": { language: 'en', name: "Inglês", file: "" },
            "spanish": { language: 'es', name: "Espanhol", file: "" }
        }) {
        return new Promise((resolve, reject) => {
            try {
                let fileMaster = '#EXTM3U';

                Object
                    .keys(vMaster)
                    .forEach(resolution => {
                        if (vMaster[resolution]['enabled'])
                            fileMaster += `\n#EXT-X-STREAM-INF:BANDWIDTH=${vMaster[resolution]['bandwidth']},RESOLUTION=${vMaster[resolution]['size']},RESOLUTION_NAME=${resolution.replace('p', '')},SUBTITLES="text"`;
                        fileMaster += `\n${vMaster[resolution]['file']}`;
                    })

                Object
                    .keys(cFile)
                    .forEach((key, index) => {
                        if (cFile[key]['file'].length > 0)
                            fileMaster += `\n#EXT-X-MEDIA:TYPE=SUBTITLES,URI="${cFile[key]['file']}",GROUP-ID="text",LANGUAGE="${cFile[key]['language']}",NAME="${cFile[key]['name']}",AUTOSELECT=${index <= 0 ? 'YES' : 'NO'}`;
                    })

                const fileM3U8 = path.localPath(this.pathbase) + '\\' + `${title}.m3u8`;

                fs.writeFile(fileM3U8, Buffer.from(fileMaster), (error) => {
                    if (error)
                        return reject(error);

                    return resolve(fileM3U8);
                });
            } catch (error) {
                return reject(error);
            }
        });
    }

    writeCaption(input, masterFile, captionFile) {
        return new Promise((resolve, reject) => {
            try {
                let playlist = webvtt.hls.hlsSegmentPlaylist(input, 10);
                playlist = playlist.replace("0.vtt", `/captions/${masterFile}/${captionFile}.vtt`);
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
                    normalizePath = context.normalizePath,
                    outputDirectory = normalizePath.call(context, 'thumbs', filePath.output);

                path.localPathCreate(outputDirectory);

                ThumbnailGenerator(
                    path.localPath(filePath.src),
                    {
                        secondsPerThumbnail: 5,
                        outputDirectory: outputDirectory,
                        outputFileName: 'thumb'
                    },
                    function () {
                        try {
                            const vttFile = path.localPath(normalizePath.call(context, 'thumbs', filePath.output)) + '\\' + 'thumb.vtt';
                            path.localPathCreate(normalizePath.call(context, 'thumbs', filePath.output));

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
                        } catch (error) {
                            return reject(error);
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