module.exports = (router, middlewareToken) => {
    const getReqProps = require('../../../modules/getReqProps'),
        LZString = require('lz-string');

    router.get(['/materials/:id'], middlewareToken, async (req, res) => {
        let {
            token,
            id
        } = getReqProps(req, [
            'token',
            'id'
        ]);

        const { privilege } = token['data'];

        let resources = [];
        switch (String(id).replace(/\W/g, '').toLowerCase()) {
            case 'grupomave':
                resources = require('./resources/grupomave.json');
                break;
            case 'smave':
                resources = require('./resources/smave.json');
                break;
            case 'vmave':
                resources = require('./resources/vmave.json');
                break;
            case 'vmavepoliciafederal':
                resources = require('./resources/vmavepoliciafederal.json');
                break;
            case 'mavesystems':
                resources = require('./resources/mavesystems.json');
                break;
            case 'mavquality':
                resources = require('./resources/mavquality.json');
                break;
            default:
                return res.status(404).render('error', {
                    title: 'Grupo Mave Digital',
                    menus: [{
                        type: 'normal',
                        icon: 'rotate-ccw',
                        first: false,
                        enabled: true,
                        title: 'Voltar',
                        onclick: "gotoSystem()"
                    }],
                    message: 'Página não encontrada 404',
                    error: null
                });
        }

        return res.status(200).render('material', {
            title: 'Grupo Mave Digital',
            router: `Sistema/Materiais/${id}`,
            privilege,
            id,
            resources,
            menus: [{
                type: 'normal',
                icon: 'pen-tool',
                first: true,
                enabled: true,
                title: `Material - ${id}`,
                onclick: ""
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