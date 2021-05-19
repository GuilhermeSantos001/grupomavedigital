module.exports = req => {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    return String(ip).slice(0, ip.indexOf(':'));
};