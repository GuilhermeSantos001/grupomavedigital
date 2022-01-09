/**
 * @description Usado para converter os videos em formato de streamer.
 * @author GuilhermeSantos001
 * @update 17/07/2021
 * @version 1.0.3
 */


import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { createInterface } from 'readline';
import { existsSync, createReadStream, writeFile, writeFileSync } from 'fs';

import { localPath, localPathCreate } from '@/utils/localpath';
import Random from '@/utils/random';
import Moment from '@/utils/moment';

const webvtt = require('node-webvtt');
const ThumbnailGenerator = require('webvtt-thumbnails-genetor');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export type ResolutionKey = "8k" | "4k" | "1080p" | "720p" | "480p" | "360p" | "240p" | "144p";

export type LanguageKey = 'pt' | 'en' | 'es';

export interface Resolution {
    key?: ResolutionKey,
    enabled: boolean;
    bandwidth: string;
    size: string;
    file?: string;
}

export interface Language {
    input: string;
    language: LanguageKey;
    name: string;
}

export interface Caption {
    portuguese: Language;
    english: Language;
    spanish: Language;
}

export interface EncodeOptions {
    title: string;
    resolutions: Resolution[];
    caption: Caption;
}

export interface MasterFileLegend {
    files_m3u8: unknown;
    files_vtt: unknown;
    files_master: unknown;
    total_languages: number
}

export interface MasterFileThumbs {
    folder: string;
    file_master: string;
}

export interface MasterFile {
    path: string;
    legend: MasterFileLegend;
    video: unknown;
    thumbs: MasterFileThumbs;
}

export interface FilePath {
    src: string;
    output: string;
}

export interface VMaster {
    "8k": Resolution;
    "4k": Resolution;
    "1080p": Resolution;
    "720p": Resolution;
    "480p": Resolution;
    "360p": Resolution;
    "240p": Resolution;
    "144p": Resolution;
}

export interface CFileKey {
    language: LanguageKey;
    name: string;
    file: string;
}

export interface CFile {
    "portuguese": CFileKey;
    "english": CFileKey;
    "spanish": CFileKey;
}

export const Bandwidth: unknown = {
    "8k": String(Math.floor(7680 * 4320 * 30 * 4 * 0.07)),
    "4k": String(Math.floor(3840 * 2160 * 30 * 4 * 0.07)),
    "1080p": String(Math.floor(1920 * 1080 * 30 * 4 * 0.07)),
    "720p": String(Math.floor(1280 * 720 * 30 * 4 * 0.07)),
    "480p": String(Math.floor(720 * 480 * 30 * 4 * 0.07)),
    "360p": String(Math.floor(640 * 360 * 30 * 4 * 0.07)),
    "240p": String(Math.floor(426 * 240 * 30 * 4 * 0.07)),
    "144p": String(Math.floor(256 * 144 * 30 * 4 * 0.07))
};

export const Size: unknown = {
    "8k": "7680X4320",
    "4k": "3840X2160",
    "1080p": "1920X1080",
    "720p": "1280X720",
    "480p": "720X480",
    "360p": "640X360",
    "240p": "426X240",
    "144p": "256X144"
};

class FFMPEG {

    constructor(
        private pathbase: string
    ) { }

    private _normalizePath(...paths: string[]): string {
        let __path = "";

        paths.forEach(_path => __path += '/' + _path);

        return this.pathbase + __path;
    }

    public encode(filePath: string, options: EncodeOptions = {
        title: `Video-Now-${Moment.format()}`,
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
        return new Promise<MasterFile>((resolve, reject) => {
            if (existsSync(filePath)) {
                try {
                    let memory: any = {},
                        _resolution: any = {},
                        maxResolutions: number = options.resolutions.length,
                        _indexResolution = 0;

                    options
                        .resolutions
                        .forEach(resolution => {
                            memory[`fileOutput_${resolution.key}`] = `_video-${options.title}-${Random.HASH(10, 'hex')}`;
                            memory[`readfileOutput_${resolution.key}`] = this._normalizePath('videos', memory[`fileOutput_${resolution.key}`], String(resolution.key?.replace("p", "")));

                            localPathCreate(this._normalizePath('videos', memory[`fileOutput_${resolution.key}`]));

                            ffmpeg(filePath, { timeout: 432000 })
                                .addOptions(this._getResolution(resolution.key || "1080p"))
                                .output(memory[`readfileOutput_${resolution.key}`])
                                .on('end', () => {
                                    const rl = createInterface({
                                        input: createReadStream(memory[`readfileOutput_${resolution.key}`]),
                                        output: process.stdout,
                                        terminal: false
                                    });

                                    let newVttFile = '';

                                    rl.on('line', (line: string) => {
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
                                        writeFile(memory[`readfileOutput_${resolution.key}`] + '.m3u8', Buffer.from(newVttFile), (error) => {
                                            if (error)
                                                return reject({ origin: `FFMPEG: Write File(${memory[`readfileOutput_${resolution.key}`] + '.m3u8'}) Failed`, details: error });

                                            _resolution[resolution.key || "1080p"] = {
                                                enabled: resolution.enabled,
                                                bandwidth: resolution.bandwidth,
                                                size: resolution.size,
                                                file: `/videos/${memory[`fileOutput_${resolution.key}`]}/${String(resolution.key?.replace("p", ""))}.m3u8`
                                            };

                                            if (++_indexResolution >= maxResolutions) {
                                                const thumbsFileM3U8 = `_thumbs-${options.title}-${Random.HASH(10, 'hex')}`;

                                                this._generateThumbs({
                                                    src: filePath,
                                                    output: thumbsFileM3U8
                                                })
                                                    .then((thumbFile: string) => {
                                                        let legendFileM3U8: any = {},
                                                            legendFileVTT: any = {},
                                                            masterLegendFile: any = {},
                                                            indexProcess = 0,
                                                            lengthProcess: number = Object.keys(options.caption).length,
                                                            _languages: any = {};

                                                        Object.keys(options.caption)
                                                            .forEach(language => {
                                                                const _options: any = options.caption;

                                                                legendFileM3U8[language] = `_legend-${options.title}-m3u8-${Random.HASH(10, 'hex')}`;
                                                                legendFileVTT[language] = `_legend-${options.title}-vtt-${Random.HASH(10, 'hex')}`;

                                                                this._writeCaption(
                                                                    _options[language]['input'],
                                                                    legendFileM3U8[language],
                                                                    legendFileVTT[language]
                                                                )
                                                                    .then((fileCaption: string) => {
                                                                        masterLegendFile[language] = fileCaption, indexProcess++;

                                                                        _languages[language] = {
                                                                            language: _options[language]['language'],
                                                                            name: _options[language]['name'],
                                                                            file: `/captions/${legendFileM3U8[language]}/${legendFileM3U8[language]}.m3u8`
                                                                        };

                                                                        if (indexProcess >= lengthProcess) {
                                                                            this._getMasterFile(
                                                                                options.title,
                                                                                _resolution,
                                                                                _languages
                                                                            )
                                                                                .then((masterFile: string) => resolve({
                                                                                    path: masterFile,
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
                                                            });
                                                    })
                                                    .catch(error => reject({ origin: `FFMPEG: Generate Thumbs(${resolution.key}) Failed`, details: error }))
                                            }
                                        });
                                    });
                                })
                                .on('error', (error) => reject({ origin: `FFMPEG: Video Encode(${filePath}) Failed`, details: error }))
                                .run();
                        });
                } catch (error) {
                    return reject({ origin: `FFMPEG: Video Encode(${filePath}) Failed`, details: error });
                }
            } else {
                return reject(`File ${filePath} no exist!`);
            }
        });
    }

    private _getResolution(resolution: ResolutionKey): string[] {
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

    private _getMasterFile(
        title = "",
        vMaster: VMaster = {
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
        cFile: CFile = {
            "portuguese": { language: 'pt', name: "Português-BR", file: "" },
            "english": { language: 'en', name: "Inglês", file: "" },
            "spanish": { language: 'es', name: "Espanhol", file: "" }
        }) {
        return new Promise<string>((resolve, reject) => {
            try {
                let fileMaster = '#EXTM3U';

                Object
                    .keys(vMaster)
                    .forEach((resolution: string) => {
                        const _vMaster: any = vMaster;

                        if (_vMaster[resolution]['enabled'])
                            fileMaster += `\n#EXT-X-STREAM-INF:BANDWIDTH=${_vMaster[resolution]['bandwidth']},RESOLUTION=${_vMaster[resolution]['size']},RESOLUTION_NAME=${resolution.replace('p', '')},SUBTITLES="text"`;

                        fileMaster += `\n${_vMaster[resolution]['file']}`;
                    });

                Object
                    .keys(cFile)
                    .forEach((key: string, index: number) => {
                        const _cFile: any = cFile;

                        if (_cFile[key]['file'].length > 0)
                            fileMaster += `\n#EXT-X-MEDIA:TYPE=SUBTITLES,URI="${_cFile[key]['file']}",GROUP-ID="text",LANGUAGE="${_cFile[key]['language']}",NAME="${_cFile[key]['name']}",AUTOSELECT=${index <= 0 ? 'YES' : 'NO'}`;
                    });

                const fileM3U8 = localPath(this.pathbase) + '\\' + `${title}.m3u8`;

                writeFile(fileM3U8, Buffer.from(fileMaster), (error) => {
                    if (error)
                        return reject(error);

                    return resolve(fileM3U8);
                });
            } catch (error) {
                return reject(error);
            }
        });
    }

    private _writeCaption(input: string, masterFile: string, captionFile: string) {
        return new Promise<string>((resolve, reject) => {
            try {
                let playlist = webvtt.hls.hlsSegmentPlaylist(input, 10);
                playlist = playlist.replace("0.vtt", `/captions/${masterFile}/${captionFile}.vtt`);
                localPathCreate(this._normalizePath('captions', masterFile));

                const captionFileM3U8 = localPath(this._normalizePath('captions', masterFile, `${masterFile}.m3u8`)),
                    captionFileVTT = localPath(this._normalizePath('captions', masterFile, `${captionFile}.vtt`));

                writeFileSync(captionFileM3U8, Buffer.from(playlist));
                writeFileSync(captionFileVTT, Buffer.from(input));

                return resolve(captionFileM3U8);
            } catch (error) {
                return reject(error);
            }
        });
    }

    private _generateThumbs(filePath: FilePath = { src: "", output: "" }) {
        return new Promise<string>((resolve, reject) => {
            try {
                const
                    context = this,
                    normalizePath = context._normalizePath,
                    outputDirectory = normalizePath.call(context, 'thumbs', filePath.output);

                localPathCreate(outputDirectory);

                ThumbnailGenerator(
                    localPath(filePath.src),
                    {
                        secondsPerThumbnail: 5,
                        outputDirectory: outputDirectory,
                        outputFileName: 'thumb'
                    },
                    function () {
                        try {
                            const vttFile = localPath(normalizePath.call(context, 'thumbs', filePath.output)) + '\\' + 'thumb.vtt';
                            localPathCreate(normalizePath.call(context, 'thumbs', filePath.output));

                            const rl = createInterface({
                                input: createReadStream(vttFile),
                                output: process.stdout,
                                terminal: false
                            });

                            let newVttFile = '';

                            rl.on('line', (line: any) => {
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
                                writeFileSync(vttFile, Buffer.from(newVttFile));

                                return resolve(vttFile);
                            });
                        } catch (error) {
                            return reject(error);
                        }
                    }
                )
            } catch (error) {
                return reject(error);
            }
        });
    }
}

module.exports = new FFMPEG('public/assets/hls');