module.exports = {
    loggedOn: (ip) => {
        return new Promise((resolve, reject) => {
            const
                fs = require('fs'),
                path = require('./localPath');

            let
                logged = [],
                loggedfile = path.localPath('sessions/logged.json');

            try {
                if (!fs.existsSync(loggedfile))
                    fs.writeFileSync(loggedfile, JSON.stringify(logged, null, 2), 'utf8');
                else {
                    logged = JSON.parse(fs.readFileSync(loggedfile, 'utf8'));
                }

                logged.push(ip);

                fs.writeFileSync(loggedfile, JSON.stringify(logged, null, 2), 'utf8');

                return resolve(`Sessão com ip(${ip}), armazenada no cache.`);
            } catch (error) {
                return reject(`Erro na hora de armazenar a sessão com ip(${ip}) no cache.`);
            }
        })
    },
    loggedOff: (ip) => {
        return new Promise((resolve, reject) => {
            const
                fs = require('fs'),
                path = require('./localPath');

            let
                logged = [],
                loggedfile = path.localPath('sessions/logged.json');

            try {
                if (!fs.existsSync(loggedfile))
                    return reject(`Erro na hora de remover a sessão com ip(${ip}) do cache.`);
                else {
                    logged = JSON.parse(fs.readFileSync(loggedfile, 'utf8'));
                }

                while (logged.filter(_ip => _ip === ip).length > 0)
                    logged.splice(logged.indexOf(ip), 1);

                fs.writeFileSync(loggedfile, JSON.stringify(logged, null, 2), 'utf8');

                return resolve(`Sessão com ip(${ip}), removida do cache.`);
            } catch (error) {
                return reject(`Erro na hora de remover a sessão com ip(${ip}) do cache.`);
            }
        })
    }
}