module.exports = (req, props = []) => {
    let reqProps = {};

    props.forEach(prop => {
        if (Object.keys(req.headers).filter(param => param === prop).length > 0) {
            if (req.headers[prop] != undefined)
                return reqProps[prop] = req.headers[prop];
        }
        if (Object.keys(req.params).filter(param => param === prop).length > 0) {
            if (req.params[prop] != undefined)
                return reqProps[prop] = req.params[prop];
        }
        if (Object.keys(req.body).filter(param => param === prop).length > 0) {
            if (req.body[prop] != undefined)
                return reqProps[prop] = req.body[prop];
        }
        if (Object.keys(req.query).filter(param => param === prop).length > 0) {
            if (req.query[prop] != undefined)
                return reqProps[prop] = req.query[prop];
        }
    });

    return reqProps;
}
