module.exports = (router, middlewareToken) => {
    const getReqProps = require('../../../modules/getReqProps');
    const hasPrivilege = require('../../../modules/hasPrivilege');

    router.get(['/manuals/:id'], middlewareToken, async (req, res) => {
        let {
            token,
            id
        } = getReqProps(req, [
            'token',
            'id'
        ]);

        const { privilege } = token['data'];

        let menus = [];

        switch (String(id).toLowerCase()) {
            case 'helpdesk':
                menus = require('./menus/helpdesk.json');
                break;
            case 'monday':
                menus = require('./menus/monday.json');
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

        id = String(id).toUpperCase();
        return res.status(200).render('manual', {
            title: 'Grupo Mave Digital',
            router: `Sistema/Manuais/${id}.`,
            privilege: hasPrivilege.alias(privilege.reverse()[0]),
            id,
            menus
        })
    });
}