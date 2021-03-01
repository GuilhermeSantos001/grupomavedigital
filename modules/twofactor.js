const speakeasy = require('speakeasy'),
    QRCode = require('qrcode');

module.exports = {
    generateQRCode: username => {
        return new Promise(async (resolve, reject) => {
            const secret = await speakeasy.generateSecret();

            QRCode.toDataURL(String(secret.otpauth_url).replace('SecretKey', `Grupo Mave Digital (${username})`), function (err, data_url) {
                if (err)
                    return reject(`QRCode Error: ${err}`);

                return resolve({
                    secret: secret.base32,
                    qrcode: data_url
                });
            })
        })
    },
    verify: (tempBase32Secret, userToken) => {
        return new Promise(async (resolve, reject) => {
            if (
                !tempBase32Secret ||
                !userToken
            )
                return reject(`Param(Secret or Token) is not valid value.`);

            try {
                resolve(await speakeasy.totp.verify({
                    secret: tempBase32Secret,
                    encoding: 'base32',
                    token: userToken
                }))
            } catch (err) {
                reject(`Two Factor Validation Failed, error: ${err}`);
            }
        })
    }
}