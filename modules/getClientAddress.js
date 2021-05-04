module.exports = req => {
    let ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;

    return ip.slice(0, ip.indexOf(':'));
};