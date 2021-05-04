module.exports = (router, middlewareToken) => {
    const
        getReqProps = require('../../../modules/getReqProps'),
        getClientAddress = require('../../../modules/getClientAddress'),
        debug = require('../../../modules/log4'),
        randomId = require('../../../modules/randomId'),
        path = require('../../../modules/localpath'),
        fs = require('fs-extra');

    router.post('/upload/file', middlewareToken, async (req, res) => {
        let {
            custompath,
            token
        } = getReqProps(req, [
            'custompath',
            'token'
        ]);

        const { auth } = token['data'];

        let fstream, chunks = [], filename_hash, filepath, handleError = [];

        req.pipe(req.busboy);

        req.busboy.on('file', (fieldname, file, filename) => {
            try {
                filename_hash = randomId(undefined, undefined, 'hash', fieldname, filename);

                filepath = typeof custompath === 'string' ? `public/${custompath}/${filename_hash}` : `public/uploads/${filename_hash}`;

                fstream = fs.createWriteStream(path.localPath(filepath));

                file.on('data', chunk => chunks.push(chunk));

                file.on('error', error => {
                    handleError.push(error);
                    return debug.fatal('files_upload', `Ocorreu um erro durante o upload do arquivo(${filename}) do usuário(${auth})`, error, [`IP-Request: ${getClientAddress(req)}`, `Server - POST`, `Path: /upload/file`])
                });

                file.on('end', () => {
                    fstream.write(Buffer.concat(chunks), error => {
                        if (error) {
                            handleError.push(error);
                            return debug.fatal('files_upload', `Erro na escrita do arquivo(${filename}) do usuário(${auth}), após o upload`, error, [`IP-Request: ${getClientAddress(req)}`, `Server - POST`, `Path: /upload/file`]);
                        }

                        debug.info('files_upload', `O arquivo(${filename}) do usuário(${auth}), foi armazenado com sucesso em ${filepath}`, [`IP-Request: ${getClientAddress(req)}`, `Server - POST`, `Path: /upload/file`]);

                        fstream.end();
                    });
                });
            } catch (error) {
                handleError.push(error);
                debug.info('files_upload', `Erro ocorrido durante o upload do arquivo(${filename}) do usuário(${auth})`, [`IP-Request: ${getClientAddress(req)}`, `Server - POST`, `Path: /upload/file`]);
            }
        });

        req.busboy.on('finish', () => {
            if (handleError.length > 0)
                return res.status(400).send({
                    success: false,
                    data: handleError
                });

            res.status(200).send({
                success: true,
                data: filename_hash
            });
        });
    });
}