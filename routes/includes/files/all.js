module.exports = (router, middlewareToken) => {
    const getReqProps = require('../../../modules/getReqProps');

    router.post(['/upload/file'], middlewareToken, async (req, res) => {
        let {
            custompath
        } = getReqProps(req, [
            'custompath'
        ]);

        try {
            const
                path = require('../../../modules/localPath'),
                fs = require('fs'),
                randomId = require('../../../modules/randomId'),
                file = req.files.attachment,
                folder = typeof custompath === 'string' ? path.localPath(`public/${custompath}`) : path.localPath('public/uploads');

            if (!fs.existsSync(folder)) {
                fs.mkdirSync(folder);
            }

            let filename = randomId(undefined, undefined, 'hash', file.name),
                filepath = `${folder}\\${filename}`;

            file.mv(filepath, async (error) => {
                if (error) {
                    return res.status(400).send({
                        success: false,
                        data: error
                    });
                }

                return res.status(200).send({
                    success: true,
                    data: filename
                })
            })
        } catch (err) {
            return res.status(400).send({
                success: false,
                data: err
            });
        }
    });
}