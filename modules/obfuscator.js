// Require Filesystem module
var fs = require('fs'),
    path = require('./localPath'),
    JavaScriptObfuscator = require('javascript-obfuscator');

module.exports = NODE_ENV => {
    console.log('\x1b[32m[%s] %s\x1b[0m', 'obfuscator', 'starting...');

    if (!path.localPathExists(`dist`))
        path.localPathCreate(`dist`);

    if (!path.localPathExists(`public/javascripts/public`))
        path.localPathCreate(`public/javascripts/public`);

    empty();
    process();

    function empty() {
        console.log('\x1b[32m[%s] %s\x1b[0m', 'obfuscator', 'cleaning the output folder...');

        let dirpath = path.localPath('public/javascripts/public/');

        fs.readdirSync(dirpath).forEach(file => {
            file = `${dirpath}${file}`;

            fs.unlink(file, function (err) {
                if (NODE_ENV === 'development' && err) {
                    console.log('\x1b[31m[%s] %s\x1b[0m', 'obfuscator', `error when removing the file: ${file}`);
                    return console.log('\x1b[31m[%s] %s\x1b[0m', 'obfuscator', `[error] ${err}`);
                }

                if (NODE_ENV === 'development')
                    console.log('\x1b[36m[%s] %s\x1b[0m', 'obfuscator', `success in removing the file: ${file}`);
            })
        });
    }

    function process() {
        console.log('\x1b[32m[%s] %s\x1b[0m', 'obfuscator', 'wait while the files are written...');

        let files = fs.readdirSync(path.localPath('dist'));

        files.forEach((file, i) => {
            i++;

            file = [
                path.localPath(`dist/${file}`),
                path.localPath(`public/javascripts/public/${file}`)
            ]

            // Read the file of your original JavaScript Code as text
            if (NODE_ENV === 'development')
                console.log('\x1b[33m[%s] %s\x1b[0m', 'obfuscator', `starting to read the file: ${file[0]}`);

            fs.readFile(file[0], 'utf8', function (err, data) {
                if (NODE_ENV === 'development' && err) {
                    console.log('\x1b[31m[%s] %s\x1b[0m', 'obfuscator', `error when reading the file(${i}/${files.length}): ${file[0]}`);
                    return console.log('\x1b[31m[%s] %s\x1b[0m', 'obfuscator', `[error] ${err}`);
                }

                // Obfuscate content of the JS file
                var obfuscationResult = JavaScriptObfuscator.obfuscate(data, {
                    optionsPreset: NODE_ENV === 'development' ? 'low-obfuscation' : 'high-obfuscation',
                    disableConsoleOutput: NODE_ENV === 'development' ? false : true,
                    domainLock: [],
                    selfDefending: true,
                    seed: 0

                });

                // Write the obfuscated code into a new file
                fs.writeFile(file[1], obfuscationResult.getObfuscatedCode(), function (err) {
                    if (NODE_ENV === 'development' && err) {
                        console.log('\x1b[31m[%s] %s\x1b[0m', 'obfuscator', `error when writing the file(${i}/${files.length}): ${file[1]}`);
                        return console.log('\x1b[31m[%s] %s\x1b[0m', 'obfuscator', `[error] ${err}`);
                    }

                    if (NODE_ENV === 'development')
                        console.log('\x1b[35m[%s] %s\x1b[0m', 'obfuscator', `success in writing the file(${i}/${files.length}): ${file[1]}`);
                });
            });
        });
    }
}