module.exports = (router, middlewareToken) => {
    const getReqProps = require('../../../modules/getReqProps');

    router.get(['/rh/appMeuRH'], middlewareToken, async (req, res) => {
        let {
            token
        } = getReqProps(req, [
            'token'
        ]);

        const { privilege } = token['data'];

        return res.status(200).render('app-meu-rh', {
            title: 'Grupo Mave Digital',
            router: 'Sistema/Recursos Humanos/APP Meu RH.',
            privilege,
            menus: [{
                type: 'normal',
                icon: 'pocket',
                first: true,
                enabled: true,
                title: 'APP Meu RH',
                onclick: ""
            },
            {
                type: 'normal',
                icon: 'image',
                first: false,
                enabled: true,
                title: 'QRCode',
                onclick: "openQRCode()"
            },
            {
                type: 'normal',
                icon: 'chevron-left',
                first: false,
                enabled: true,
                title: 'Voltar',
                onclick: 'gotoSystem()'
            }]
        })
    });
}