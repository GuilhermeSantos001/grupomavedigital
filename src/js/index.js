(function () {
    "use strict";

    // ======================================================================
    // Import of Globals(APP)
    //
    window.app = window.app || {};

    document.addEventListener('DOMContentLoaded', () => {
        const video = document.querySelector('video'),
            source = video.getElementsByTagName("source")[0].src;

        // For more options see: https://github.com/sampotts/plyr/#options
        // captions.update is required for captions to work with hls.js

        if (!Hls.isSupported()) {
            video.src = source;
        } else {
            // For more Hls.js options, see https://github.com/dailymotion/hls.js
            const hls = new Hls({ debug: false, autoStartLoad: true });
            hls.attachMedia(video);
            hls.loadSource(source);

            hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
                // For more options see: https://github.com/sampotts/plyr/#options
                // captions.update is required for captions to work with hls.js
                const availableQualities = hls.levels.map((level) => Number(level.attrs.RESOLUTION_NAME)).reverse(),
                    customOptions = {
                        title: 'Grupo Mave - Institucional | Abril, 2021',
                        tooltips: { controls: true, seek: true },
                        storage: { enabled: true, key: 'plyr' },
                        seekTime: 5,
                        controls: [
                            'play-large', // The large play button in the center
                            'restart', // Restart playback
                            'rewind', // Rewind by the seek time (default 10 seconds)
                            'play', // Play/pause playback
                            'fast-forward', // Fast forward by the seek time (default 10 seconds)
                            'progress', // The progress bar and scrubber for playback and buffering
                            'current-time', // The current time of playback
                            'duration', // The full duration of the media
                            'mute', // Toggle mute
                            'volume', // Volume control
                            'captions', // Toggle captions
                            'settings', // Settings menu
                            'pip', // Picture-in-picture (currently Safari only)
                            'airplay', // Airplay (currently Safari only)
                            'download', // Show a download button with a link to either the current source or a custom URL you specify in your options
                            'fullscreen', // Toggle fullscreen
                        ],
                        captions: { active: true, update: true, language: 'pt' },
                        quality: {
                            default: availableQualities[0],
                            options: availableQualities,
                            forced: true,
                            onChange: (newQuality) => updateQuality(newQuality)
                        },
                        previewThumbnails: { enabled: true, src: "/thumbs/57a029c46fea73e49c20ac761807153310d1c55bl/thumb.vtt" },
                        invertTime: false
                    }

                const player = new Plyr(video, customOptions);

                // Handle changing captions
                player.on('languagechange', () => {
                    // Caption support is still flaky. See: https://github.com/sampotts/plyr/issues/994
                    setTimeout(() => hls.subtitleTrack = player.currentTrack, 50);
                });

                function updateQuality(newQuality) {
                    let _hls = window.hls || hls;

                    _hls.levels.map((level, indexLevel) => {
                        if (newQuality === Number(level.attrs.RESOLUTION_NAME)) {
                            _hls.currentLevel = indexLevel;
                            _hls.loadLevel = indexLevel;
                            _hls.startLoad();
                            console.log('CHANGE QUALITY FOR', newQuality, indexLevel);
                        }
                    })
                }

                // Expose player so it can be used from the console
                window.player = player;
                window.hls = hls;

                let plyr_storage = JSON.parse(localStorage.getItem('plyr'));
                if (plyr_storage) {
                    if (plyr_storage.quality != undefined)
                        updateQuality(JSON.parse(localStorage.getItem('plyr')).quality);
                }
            });
        }
    });

    // ======================================================================
    // Export to Globals(APP)
    //
    // [
    //     { 'alias': 'login', 'function': login },
    // ].forEach(prop => window.app[prop['alias']] = prop['function']);
})();