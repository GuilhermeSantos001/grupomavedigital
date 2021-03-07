const jwt = require('jsonwebtoken');
const secret = process.env.APP_SECRET;

module.exports = {
    /**
     * @param {any} data Data a ser armazenada no token
     * @param {String} expiry Tempo de expiração do token, por padrão são 5 minutos.
     */
    sign: (data, expiry = "5m") => {
        return jwt.sign({
            data: data
        }, secret, {
            expiresIn: expiry
        });
    },
    /**
     * @param {string} token Token a ser verificado
     */
    verify: (token) => {
        return new Promise((resolve, reject) => {
            jwt.verify(token, secret, (err, decoded) => {
                return err ? reject(err) : resolve(decoded);
            });
        })
    }
}