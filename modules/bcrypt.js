const bcrypt = require('bcrypt');

module.exports = {
    crypt: (password, saltRounds = 10) => {
        return new Promise((resolve, reject) => {
            bcrypt.genSalt(saltRounds, function (err, salt) {
                if (err) return reject(err);

                bcrypt.hash(password, salt, function (err, hash) {
                    if (err) return reject(err);

                    return resolve(hash);
                })
            })
        })
    },
    compare: (password, hash) => {
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, hash, function (err, result) {
                if (err) return reject(err);

                return resolve(result);
            })
        })
    }
}