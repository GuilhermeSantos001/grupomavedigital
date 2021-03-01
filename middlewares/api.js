const code = process.env.API_AUTHORIZATION;
const getReqProps = require('../modules/getReqProps');

module.exports = (req, res, next) => {
    const authHeader = getReqProps(req, ['authorization'])['authorization'];

    if (!authHeader) return res.status(401).send({
        success: false,
        error: 'No authorization code provided!'
    });

    if (code != authHeader) return res.status(401).send({
        success: false,
        error: 'Verify your code authorization.'
    });

    return next();
};