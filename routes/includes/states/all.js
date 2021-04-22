module.exports = (router, middlewareAPI) => {
    const mongoDB = require('../../../modules/mongodb'),
        getReqProps = require('../../../modules/getReqProps');

    router.get(['/states'], middlewareAPI, async (req, res) => {
        let {
            country,
            dataFilter
        } = getReqProps(req, [
            'country',
            'dataFilter'
        ]);

        try {
            /**
             * Validação dos parametros
             */

            if (!dataFilter) dataFilter = '';

            if (
                typeof country != 'string'
            )
                return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

            mongoDB.states.get(
                'country',
                country,
                dataFilter
            )
                .then(data => {
                    return res.status(200).send({
                        message: 'Grupo Mave Digital - Success!!!',
                        data
                    })
                })
                .catch(err => res.status(400).send({
                    message: 'Grupo Mave Digital - Error!!!',
                    error: err
                }))
        } catch (err) {
            return res.status(400).send({
                message: 'Grupo Mave Digital - Error!!!',
                error: err
            });
        }
    });

    router.post(['/states/register'], middlewareAPI, async (req, res) => {
        let {
            name,
            cities
        } = getReqProps(req, [
            'name',
            'cities'
        ]);

        try {
            /**
             * Validação dos parametros
             */

            if (
                typeof name != 'string' ||
                cities instanceof Array === false
            )
                return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

            mongoDB.states.register(
                name,
                cities
            )
                .then(data => {
                    return res.status(200).send({
                        message: 'Grupo Mave Digital - Success!!!',
                        data
                    })
                })
                .catch(err => res.status(400).send({
                    message: 'Grupo Mave Digital - Error!!!',
                    error: err
                }))
        } catch (err) {
            return res.status(400).send({
                message: 'Grupo Mave Digital - Error!!!',
                error: err
            });
        }
    });
}