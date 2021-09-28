/**
 * @description Controlador central do hercules storage
 * @author @GuilhermeSantos001
 * @update 04/08/2021
 * @version 1.0.0
 */

import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

export default class Controller {
    constructor() { };

    static folders = [];
    static files = [];
    static folderName = null;
    static folderId = null;
    static layerMain = '#container-main';
    static layerMaster = '#container-content';
    static layerTrash = '#container-trash';
    static layerButtonCreate = '#container-buttons-create';
    static layerButtonActions = '#container-buttons-actions';
    static delayStep = 1800;
    static offCanvasReopen = {};
    static lastAppendFolder = {};

    /**
     * @description Gerenciamento de cache
     */

    static cache_list = {};

    static cache_list_setter(key, value) {
        if (!this.cache_list[key])
            this.cache_list[key] = [];

        if (this.cache_list[key].indexOf(value) === -1)
            this.cache_list[key].push(value);
    };

    static cache_list_update(key, value) {
        if (!this.cache_list[key])
            this.cache_list[key] = [];

        const index = this.cache_list[key].indexOf(value);

        if (index !== -1)
            this.cache_list[key][index] = value;
        else
            this.cache_list[key] = [value];
    };

    static cache_list_replaceAll(key, value) {
        if (value instanceof Array == false)
            this.cache_list[key] = [value];
        else
            this.cache_list[key] = value;
    };

    static cache_list_remove(key, value) {
        if (!this.cache_list[key])
            this.cache_list[key] = [];

        const index = this.cache_list[key].indexOf(value);

        if (index !== -1)
            this.cache_list[key].splice(index, 1);
        else
            this.cache_list[key] = null;
    };

    static cache_list_getter(key, value) {
        if (!this.cache_list[key])
            this.cache_list[key] = [];

        if (value !== undefined) {
            const index = this.cache_list[key].indexOf(value);

            if (index !== -1)
                return this.cache_list[key][index];
        } else {
            if (
                this.cache_list[key] instanceof Array && this.cache_list[key].length > 0 ||
                this.cache_list[key] instanceof Array === false && typeof this.cache_list[key] !== 'undefined'
            )
                return this.cache_list[key];
        };

        return false;
    };

    /**
     * @description Geração de ID com 9 dígitos
     */

    static index() {
        return String(Math.floor(Math.random() * 9e9));
    };

    /**
     * @description Privilégios disponíveis na plataforma
     */
    static _privileges = ['???'];

    static setPrivileges(privileges) {
        this._privileges = privileges;
    };

    static privileges() {
        return this._privileges;
    };

    /**
     * @description Quantidade de dias que as pastas e/ou arquivos ficam na lixeira
     */
    static _trashDays = '???';

    static setTrashDays(trashDays) {
        this._trashDays = trashDays;
    };

    static trashDays() {
        return this._trashDays;
    };

    /**
     * @description Extensões de arquivo autorizadas
     */
    static _extensions = [];

    static setFileExtensions(extensions) {
        this._extensions = extensions;
    };

    static extensions() {
        return this._extensions;
    };

    /**
     * @description Extensões de arquivo autorizadas
     */
    static _specialCharacters = /[\!\@\#\$\%\¨\`\´\&\*\(\)\-\_\+\=\§\}\º\{\}\[\]\'\"\/\.\,\;\<\>\^\~\?\|\\]/g;

    static specialCharacters() {
        return new RegExp(this._specialCharacters);
    };

    /**
     * @description Tamanho máximo autorizado do arquivo
     */
    static _maxSize = 20000000; // 20 MB

    static setFileMaxSize(maxSize) {
        this._maxSize = maxSize;
    };

    static maxSize() {
        return this._maxSize;
    };

    /**
     * @description Socket.io
     */

    static _socket = undefined;

    static setSocket(socket) {
        if (!this._socket)
            this._socket = socket;
    };

    static socket() {
        return this._socket;
    };

    static socketId() {
        if (this.socket())
            return this.socket().id;
    }

    static isSocketConnected() {
        if (this.socket())
            return this.socket().connected;
    };

    static emit(channel, ...messages) {
        if (!this.isSocketConnected()) {
            let interval = setInterval(() => {
                if (this.isSocketConnected()) {
                    this.socket().emit(channel, messages);
                    clearInterval(interval);
                };
            }, this.delayStep);
        } else {
            this.socket().emit(channel, messages);
        };
    };

    static global(channel, ...messages) {
        if (!this.isSocketConnected()) {
            let interval = setInterval(() => {
                if (this.isSocketConnected()) {
                    this.socket().emit('GLOBAL', channel, messages);
                    clearInterval(interval);
                };
            }, this.delayStep);
        } else {
            this.socket().emit('GLOBAL', channel, messages);
        };
    };

    static broadcast(channel, ...messages) {
        if (!this.isSocketConnected()) {
            let interval = setInterval(() => {
                if (this.isSocketConnected()) {
                    this.socket().emit('BROADCAST', channel, messages);
                    clearInterval(interval);
                };
            }, this.delayStep);
        } else {
            this.socket().emit('BROADCAST', channel, messages);
        };
    };

    static on(channel, callback) {
        const key = `on-${channel}`;

        if (!this.isSocketConnected()) {
            let interval = setInterval(() => {
                if (this.isSocketConnected()) {
                    if (!this.cache_list_getter(key)) {
                        this.cache_list_replaceAll(key, true);
                        this.socket().on(channel, callback);
                        clearInterval(interval);
                    } else {
                        clearInterval(interval);
                    };
                };
            }, this.delayStep);
        } else {
            if (!this.cache_list_getter(key)) {
                this.cache_list_replaceAll(key, true);
                this.socket().on(channel, callback);
            };
        };
    };

    /**
     * @description Funções para composição dos elementos no DOM
     */

    static drawConnection() {
        this.drawStatusSteps();
        this.drawStep('connection-stablish', 'Estabelecendo conexão...');

        let interval = setInterval(() => {
            if (this.isSocketConnected()) {
                this.completeStep('connection-stablish');
                this.closeStatusSteps();
                clearInterval(interval);
            };
        }, this.delayStep);
    };

    static drawMessageNoItems() {
        $(this.layerMaster)
            .append(`
            <p class="text-muted border-top p-2" id="layerNoItems">Não há items a serem exibidos.</p>
            `);
    };

    static removeMessageNoItems() {
        if ($('#layerNoItems'))
            $('#layerNoItems').fadeOut('fast').remove();
    };

    static closeAllOffcanvasOfItem(cid) {
        const item = this.getCacheItem(cid);

        if (item && item.offcanvas) {
            const elements = [
                document.getElementById(item.offcanvas.info),
                document.getElementById(item.offcanvas.downloadVersion),
                document.getElementById(item.offcanvas.moveItemFor)
            ];

            this.offCanvasReopen[cid] = null;

            for (const element of elements) {
                if (element) {
                    const bsOffcanvas = bootstrap.Offcanvas.getInstance(element);

                    if (bsOffcanvas)
                        bsOffcanvas.hide();
                };
            };

        };
    };

    static drawStatusSteps() {
        if ($('#container-global-steps').length <= 0) {
            $('body')
                .append(`
                <div id="container-global-steps">
                    <svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
                        <symbol id="check-circle-fill" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                        </symbol>
                        <symbol id="info-fill" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                        </symbol>
                        <symbol id="exclamation-triangle-fill" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                        </symbol>
                    </svg>
                    <div class="alert bg-primary text-secondary border border-secondary fixed-bottom m-2" id="container-steps" role="alert" style="z-index: 99999; opacity: 0; top: 80px;">
                        <h4 class="alert-heading">Aguarde um momento</h4>
                        <hr>
                        <div id="container-status-steps"></div>
                        <div class="flex flex-row text-center p-2 my-2 fixed-bottom" id="container-buttons-steps"></div>
                        <div class="p-2 border border-secondary" id="container-details-steps" style="opacity: 0;"></div>
                    </div>
                </div>
            `);

            $('#container-steps').animate({
                opacity: 1,
                top: 0
            }, "fast");
        };
    };

    static drawStep(label, step) {
        $('#container-status-steps')
            .append(`
            <div class="d-flex align-items-center border-bottom border-secondary my-2 p-2">
                <strong class="col-11 text-truncate">${step}</strong>
                <div class="spinner-border ms-auto" role="status" aria-hidden="true" id="step-${label}" style="opacity: 0; top: -30px;">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
            `);

        $(`#step-${label}`).animate({
            opacity: 1,
            top: 0
        }, "fast");
    };

    static drawDetailsSteps(step) {
        $('#container-details-steps')
            .append(`<p class="fw-bold text-break text-secondary my-1">${step}</p>`)
            .animate({
                opacity: 1
            }, "fast");
    };

    static completeStep(label) {
        $(`#step-${label}`)
            .replaceWith('<svg class="bi flex-shrink-0 ms-auto" width="30" height="30" role="img" aria-label="Success:"><use xlink:href="#check-circle-fill"/></svg>');
    };

    static warningStep(label) {
        $(`#step-${label}`)
            .replaceWith('<svg class="bi flex-shrink-0 ms-auto" width="30" height="30" role="img" aria-label="Danger:"><use xlink:href="#exclamation-triangle-fill"/></svg>');
    };

    static drawButtonsStep() {
        $('#container-buttons-steps')
            .append(`<button type="button" class="btn btn-outline-secondary col-6 mx-2" id="step-button-complete" style="opacity: 0;">Finalizar</button>`)

        $(`#step-button-complete, #step-button-info`)
            .animate({
                opacity: 1
            }, "fast");

        $('#step-button-complete').on('click', () => this.closeStatusSteps());
    };

    static closeStatusSteps() {
        $('#container-steps')
            .animate({
                opacity: 0,
                top: window.innerHeight
            }, 'fast', function () {
                $('#container-global-steps').remove();
            });
    };

    static drawFolderTree() {
        $('body')
            .addClass('overflow-hidden')
            .append(`
            <div id="container-background-folder-tree" class="bg-dark bg-gradient fixed-top" style="opacity: 0; width: 100vw; height: 100vh; z-index: 99999;"></div>
            <div id="container-folder-tree" style="opacity: 0;">
                <div class="bg-light bg-gradient text-primary border border-primary fixed-top shadow m-2" id="content-folder-tree" style="height: 98vh; z-index: 999999;">
                    <div class="d-flex bg-primary col-12 text-secondary p-2 fw-bold">
                        <div class="p-2 w-100">
                            <span class="align-middle fs-4">Explorador de Pastas</span>
                        </div>
                        <div class="p-2 flex-shrink-1 align-self-center">
                            <button type="button" class="btn-close btn-close-white" id="close-button-folder-tree" aria-label="Close"></button>
                        </div>
                    </div>
                    <div class="row gx-2 mb-2 p-2 border-bottom">
                        <div class="col-12">
                            <div class="input-group p-2">
                                <span class="input-group-text" id="search-folder-tree-addon">
                                    <i class="icon-folder"></i>
                                </span>
                                <input type="text" class="form-control" id="input-search-folder-tree" placeholder="Procurar por uma pasta" aria-label="Search-Folder-Tree" aria-describedby="search-folder-tree-addon">
                            </div>
                        </div>
                    </div>
                    <ul class="file-tree" id="list-folder-tree"></ul>
                </div>
            </div>
        `);

        Controller.drawListFolderTree();
        Controller.handleButtonCloseFolderTree();

        $('#container-background-folder-tree')
            .animate({
                opacity: .5
            }, "fast");

        $('#container-folder-tree')
            .animate({
                opacity: 1,
                top: 0
            }, "fast");

        $(".file-tree").filetree();
    };

    static handleButtonCloseFolderTree() {
        $(`#close-button-folder-tree`)
            .on("click", () => {
                $('#container-background-folder-tree, #container-folder-tree')
                    .animate({
                        opacity: 0
                    }, "fast", function () {
                        $(this).remove();
                        $(".context-menu-list").remove();
                    });
            });
    };

    static handleContextMenu(contextMenuId, folder) {
        $.contextMenu({
            selector: `#${contextMenuId}`,
            callback: async function (key, options) {
                const
                    cid = $(options.selector).data('contextMenuFolderCid'),
                    item = await (async () => {
                        let value = Controller.getCacheItem(cid);

                        if (!value)
                            value = await window.app.getFolderInfo(cid);

                        return Array.isArray(value) ? value.length > 0 ? value.at(0) : false : value;
                    })();

                if (!item)
                    return window.app.alerting(`A pasta não pode ser acessada no momento. Fale com administrador do sistema.`);

                if (key === 'open') {
                    return Controller.handleOpenFolder(item);
                } else if (key === 'rename') {

                } else if (key === 'remove') {

                };
            },
            items: {
                "open": {
                    name: "Abrir",
                    icon: "fas fa-folder-open",
                    disabled: folder.foldersId.length <= 0
                },
                "rename": {
                    name: "Renomear",
                    icon: "fas fa-edit"
                },
                "remove": {
                    name: "Remover",
                    icon: "fas fa-trash"
                },
                "step": "---------",
                "quit": {
                    name: "Sair",
                    icon: function () {
                        return 'context-menu-icon context-menu-icon-quit';
                    }
                }
            }
        });
    };

    static drawListFolderTree() {
        Controller.processListFolderTree(Controller.folders, "list-folder-tree");
    };

    static processListFolderTree(folders, listId, subfolders) {
        if (folders.length <= 0)
            return;

        for (const folder of folders) {
            Controller.appendListItemFolderTree(folder, listId, subfolders);
        };
    };

    static async appendListItemFolderTree(folder, listId, subfolders) {
        const
            subfoldersId = `subfolders-${Controller.index()}`,
            contextMenuId = `context-menu-folder-tree-${Controller.index()}`;

        $(`#${listId}`)
            .append(`
            <li ${subfolders ? `class="folder-root closed"` : ''}>
                <a id="${contextMenuId}" data-context-menu-folder-cid="${folder.cid}" href="#">${folder.name}</a>
                ${folder.foldersId.length > 0 ? `
                <ul id="${subfoldersId}"></ul>
                `: `
                <ul></ul>
                `}
            </li>
            `);

        this.handleContextMenu(contextMenuId, folder);

        if (folder.foldersId.length > 0)
            Controller.appendSubFolderTree(folder, subfoldersId);
    };

    static async appendSubFolderTree(folder, subfoldersId) {
        if (folder.foldersId.length > 0) {
            let folders = [];

            for (const cid of folder.foldersId) {
                const subFolder = await window.app.getFolderInfo(cid);

                if (subFolder.length > 0)
                    folders.push(subFolder.at(0));
            };

            if (folders.length > 0)
                return Controller.processListFolderTree(folders, subfoldersId, true);
        };
    };

    static hoverShadow(id, type) {
        const removeClass = '\
        bg-transparent \
        bg-primary \
        bg-danger \
        text-primary \
        text-secondary \
        text-danger \
        text-white \
        shadow \
        ';

        if (type === 'available') {
            $(id).on({
                mouseenter: function () {
                    if (!$(this).hasClass('shadow'))
                        return $(this)
                            .removeClass(removeClass)
                            .addClass('bg-primary text-secondary bg-gradient shadow');
                },
                mouseleave: function () {
                    if ($(this).hasClass('shadow'))
                        return $(this)
                            .removeClass(removeClass)
                            .addClass('bg-transparent text-primary');
                }
            });
        } else if (type === 'trash') {
            $(id).on({
                mouseenter: function () {
                    if (!$(this).hasClass('shadow'))
                        return $(this)
                            .removeClass(removeClass)
                            .addClass('bg-danger text-white bg-gradient shadow');
                },
                mouseleave: function () {
                    if ($(this).hasClass('shadow'))
                        return $(this)
                            .removeClass(removeClass)
                            .addClass('bg-transparent text-danger');
                }
            });
        };
    };

    static drawButtonActions() {
        $(this.layerButtonActions)
            .append(`
            <button type="button" class="btn btn-outline-danger col mx-2" id="button-actions-remove" data-bs-toggle="offcanvas" data-bs-target="#offcanvas-remove-itens" aria-controls="offcanvas-remove-itens" disabled>
                <i class="icon-trash-alt me-2"></i> Remover items
            </button>
            `);

        $(this.layerMain)
            .append(`
            <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvas-remove-itens" aria-labelledby="offcanvas-remove-itens">
                <div class="offcanvas-header bg-primary bg-gradient text-secondary fw-bold border-bottom">
                    <h5 class="offcanvas-title" id="offcanvas-remove-itens">Mover para a lixeira</h5>
                    <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </div>
                <p class="my-2 p-2 text-muted">Os items a baixo serão movidos para a lixeira, eles estarão disponíveis por ${this.trashDays()} dia(s).</p>
                <div class="offcanvas-body border-top border-bottom small">
                    <ul class="list-group list-group-flush" id="list-remove-items"></ul>
                    <button type="button" class="btn btn-primary col-12 my-2" id="btn-confirm-remove-items" data-bs-dismiss="offcanvas" aria-label="Close">
                    Confirmar
                    </button>
                </div>
                <div class="my-2 p-2 col-12">
                    <p class="p-2 text-muted">O proprietário/procurador(es) e/ou grupo(s)/usuário(s) que tenham permissão de segurança poderão ver o conteúdo do pasta/arquivo.</p>
                    <a class="btn btn-outline-danger col-12" href="${window.app.baseurl}/system/storage/hercules/help" target="_blank" role="button">
                    Precisa de ajuda?
                    </a>
                </div>
                <div class="text-center border-top my-2 p-2">
                    <button type="button" class="btn btn-primary col-12 my-1" data-bs-dismiss="offcanvas" aria-label="Close">
                        <i class="icon-chevron-circle-left me-2"></i> Voltar
                    </button>
                </div>
            </div>
            `);

        $('#btn-confirm-remove-items')
            .on('click', this.confirmRemoveItems.bind(this));
    };

    static verifyStatus(item) {
        if (item.trash)
            return `trash`;

        return true;
    };

    static setCacheItem(index, type, item) {
        const props = {
            index,
            typeof: type,
            offcanvas: {
                info: `offcanvas-information-${index}`,
                downloadVersion: `offcanvas-download-versions-${index}`,
                moveItemFor: `offcanvas-move-item-for-${index}`
            }
        };

        if (!this.getCacheItem(item.cid)) {
            this.cache_list_setter(`items`, {
                ...item,
                ...props
            });
        } else {
            let cache = this.cache_list_getter(`items`);

            this.cache_list_replaceAll(`items`, cache.map(_item => {
                if (_item.cid === item.cid) {
                    _item.index = props.index;
                    _item.offcanvas = props.offcanvas;
                };

                return _item;
            }));
        };
    };

    static getCacheItem(cid) {
        const cache = this.cache_list_getter(`items`);

        if (cache.length > 0)
            return cache.find(item => item.cid === cid);

        return false;
    };

    static removeCacheItem(cid) {
        let cache = [...this.cache_list_getter(`items`)];

        this.cache_list_replaceAll(`items`, cache.filter(item => item.cid !== cid));

        console.log(this.cache_list_getter(`items`));
    };

    static updateCacheItem(cid, newItem) {
        let cache = this.cache_list_getter(`items`);

        if (cache.length > 0) {
            if (cache.filter(item => item.cid === cid).length <= 0)
                return this.cache_list_setter('items', newItem);

            for (const [i, item] of cache.entries()) {
                if (item.cid === cid) {
                    cache[i] = Object.assign(cache[i], newItem);
                };
            };
        };
    };

    static cidIsValid(item) {
        return item && typeof item.cid === 'string';
    };

    static async isAuthor(item) {
        const { auth } = await window.app.storage_get_userInfo();

        if (item.authorId === auth)
            return true;

        return false;
    };

    static async isAssignee(item) {
        const { email } = await window.app.storage_get_userInfo();

        let response = false;

        for (const assignee of item.assignees) {
            if (assignee.email === email) {
                response = true;
                break;
            }
        };

        return response;
    };

    static async hasPrivilege(item, permission) {
        const { email, privileges } = await window.app.storage_get_userInfo();

        let result = false;

        if (item.accessGroupId.length > 0) {
            for (const privilege of item.accessGroupId) {
                if (privileges.filter(usr_privilege => {
                    if (privilege.name === usr_privilege && privilege.permissions.includes(permission)) {
                        result = {
                            value: usr_privilege,
                            type: 'privilege'
                        };

                        return true;
                    };
                }).length > 0) break;
            };
        };

        if (!result)
            if (item.accessUsersId.length > 0) {
                for (const privilege of item.accessUsersId) {
                    if (privilege.email === email && privilege.permissions.includes(permission)) {
                        result = {
                            value: email,
                            type: 'email'
                        };

                        break;
                    };
                };
            };

        return result;
    };

    static disableButton(selector) {
        return $(selector).attr('disabled', true);
    };

    static enableButton(selector) {
        return $(selector).attr('disabled', false);
    };

    static tooltip(id) {
        let item = $(id);

        if (item)
            return new bootstrap.Tooltip(item);
    };

    static async getUserPermission(item, permission) {
        const
            result = await this.hasPrivilege(item, permission);

        if (result && result.type === 'privilege')
            return JSON.stringify({ privilege: result.value });

        if (result && result.type === 'email')
            return JSON.stringify({ email: result.value });

        return JSON.stringify(false);
    };

    static localeDateString(date) {
        let
            now = new Date(date),
            value1 = now.toLocaleString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
            value2 = now.toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        return `${value1} às ${value2}`;
    };

    static async append(item, type, first) {
        this.removeMessageNoItems();

        if (this.verifyStatus(item) === 'trash') {
            this.drawTrashState(item, type, first);
        } else {
            this.drawNormalState(item, type, first);
        };
    };

    /**
     * @description Div do container do item
     */
    static divContainerItem(index, item, type, status) {
        let
            badge = {
                'color': 'primary',
                'span': `${type}-available`
            },
            content_div_width = '95%',
            offCanvasData = (() => {
                if (
                    status === 'available' ||
                    status === 'trash'
                ) {
                    return `data-bs-toggle="offcanvas" data-bs-target="#offcanvas-information-${index}" aria-controls="offcanvas-information-${index}"`;
                } else {
                    return ``;
                };
            })(),
            delete_div = (() => {
                if (status === 'available') {
                    return `
                    <div class="form-check py-1 h-100 position-relative" style="width: 5%;" id="item-delete-container-${index}">
                        <input class="form-check-input position-absolute my-2 start-100" type="checkbox" value="remove" id="item-delete-${index}" style="cursor: pointer;">
                    </div>
                    `;
                } else {
                    content_div_width = '100%';
                    return ``;
                };
            })(),
            text_color = `primary`;

        status = (() => {
            if (status === 'available') {
                return `Disponível`;
            }
            else if (status === 'unavailable') {
                badge.color = 'dark-gray';
                badge.span = `${type}-unavailable`;
                text_color = `dark-gray`;

                return `Indisponível`;
            }
            else if (status === 'trash') {
                badge.color = 'danger';
                badge.span = `${type}-trash`;
                text_color = `danger`;

                return `Removido`;
            };
        })();

        if (type === 'folder')
            this.handleContextMenu(`container-item-${index}`, item);

        return `
        <div class="card col-12 bg-transparent text-${text_color} fw-bold fs-6 my-2 px-2 transition" id="container-item-${index}" data-context-menu-folder-cid="${item.cid}" style="height: 7vh; cursor: pointer;" data-bs-toggle="tooltip" data-bs-placement="top" title="${item.description.length > 32 ? `${item.description.slice(0, 32)}...` : `${item.description}`}">
            <div class="d-flex flex-row card-body p-0 col-12">
                ${delete_div}
                <div class="p-auto position-relative" style="width: ${content_div_width};" ${offCanvasData}>
                    <p class="py-auto py-lg-2 text-truncate" id="container-item-name-${index}">
                        ${type === 'folder' ? `
                        <i class="icon-folder me-2"></i> ${item.name}
                        `: `
                        <i class="icon-file me-2"></i> ${item.name}${item.type} <br/>
                        `}
                    </p>
                    <span class="position-absolute border top-50 start-100 translate-middle badge rounded-pill bg-${badge.color} shadow">
                        ${status}
                        <span class="visually-hidden">${badge.span}</span>
                    </span>
                </div>
            </div>
        </div>
        `;
    };

    static drawFirstItem(first, layer, index, item, type, status) {
        if (!first) {
            $(layer)
                .append(this.divContainerItem(index, item, type, status));
        }
        else {
            if (type === 'folder') {
                if (
                    Controller.lastAppendFolder[status]
                ) {
                    $(Controller.lastAppendFolder[status])
                        .after(this.divContainerItem(index, item, type, status));
                } else {
                    $(layer)
                        .prepend(this.divContainerItem(index, item, type, status));
                };

            } else if (type === 'file') {
                $(layer)
                    .append(this.divContainerItem(index, item, type, status));
            };
        };

        if (type === 'folder') {
            Controller.lastAppendFolder[status] = `#container-item-${index}`;
        };
    };

    /**
     * @description Composição quando o item está com o status normal
     */
    static async drawNormalState(item, type, first) {
        const index = this.index();

        this.drawFirstItem(first, this.layerMaster, index, item, type, 'available');
        this.hoverShadow(`#container-item-${index}`, 'available');
        this.tooltip(`#container-item-${index}`);

        this.drawNormalOffCanvas(item, type, index);

        for (const group of item.accessGroupId) {
            this.drawWhitelistGroup(index, group);
        };

        for (const user of item.accessUsersId) {
            await this.drawWhitelistUser(index, item.authorId, user);
        };

        if (type === 'file') {
            this.drawButtonDownloadVersions(index, item);
            this.handleButtonDownloadActualVersion(index, item);
            this.handleButtonDownloadMultiplesVersions(index, item);
        };

        this.setCacheItem(index, type, item);
        this.changeWithPrivilege(index, item, 'available');
        this.deleteItem(index, type, item);
        this.insertWhiteList(index, type, item.cid, { groups: item.accessGroupId, users: item.accessUsersId });
        this.removeWhitelist(index, type, item.cid);
        this.handleButtonMoveItemFor(index, item, type);
    };

    static async drawNormalOffCanvas(item, type, index) {
        if (type === 'file') {
            $(this.layerMain)
                .append(`
                <div class="offcanvas offcanvas-end" tabindex="-1" data-bs-backdrop="true" id="offcanvas-information-${index}" aria-labelledby="offcanvas-information-label-${index}">
                    <div class="offcanvas-header bg-primary bg-gradient text-secondary fw-bold border-bottom">
                        <h5 class="offcanvas-title" id="offcanvas-information-label-${index}">Sobre</h5>
                        <button type="button" class="btn-close btn-close-white text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                    </div>
                    <div class="offcanvas-body small">
                        <ul class="nav nav-tabs" id="tab-information-${index}" role="tablist">
                            <li class="nav-item col-12 col-md-6" role="presentation">
                                <button class="nav-link col-12 active text-primary text-truncate fw-bold" id="tab-info-label-${index}" data-bs-toggle="tab" data-bs-target="#tab-info-${index}" type="button" role="tab" aria-controls="tab-info-${index}" aria-selected="true">
                                    <i class="icon-info-circle me-2"></i> Info.
                                </button>
                            </li>
                            <li class="nav-item col-12 col-md-6" role="presentation">
                                <button class="nav-link col-12 text-primary text-truncate fw-bold" id="tab-whitelist-label-${index}" data-bs-toggle="tab" data-bs-target="#tab-whitelist-${index}" type="button" role="tab" aria-controls="tab-whitelist-${index}" aria-selected="false">
                                    <i class="icon-clipboard-list me-2"></i> Whitelist.
                                </button>
                            </li>
                            <li class="nav-item col-12 col-md-6" role="presentation">
                                <button class="nav-link col-12 text-primary text-truncate fw-bold" id="tab-assignees-label-${index}" data-bs-toggle="tab" data-bs-target="#tab-assignees-${index}" type="button" role="tab" aria-controls="tab-assignees-${index}" aria-selected="false">
                                    <i class="icon-hands-helping me-2"></i> Procuradores.
                                </button>
                            </li>
                        </ul>
                        <div class="tab-content" id="tab-content-information-${index}">
                            <div class="tab-pane fade show active py-2" id="tab-info-${index}" role="tabpanel" aria-labelledby="tab-info-label-${index}">
                                <div class="input-group">
                                    <span class="input-group-text" id="addon-name-${index}">
                                        <i class="icon-file"></i>
                                    </span>
                                    <input type="text" class="form-control" id="input-item-name-${index}" placeholder="Name..." aria-label="item-name-${index}" aria-describedby="addon-name-${index}" value="${item.name}" disabled>
                                </div>
                                <div class="form-floating my-2">
                                    <textarea class="form-control" placeholder="Descrição..." id="floating-textarea-description-${index}" style="height: 100px" disabled>${item.description}</textarea>
                                    <label for="floating-textarea-description-${index}">Descrição</label>
                                </div>
                                <div class="input-group my-2">
                                    <span class="input-group-text" id="addon-versions-${index}">
                                        <i class="icon-code-branch"></i>
                                    </span>
                                    <input type="text" class="form-control" id="input-versions-${index}" placeholder="Versions..." aria-label="item-versions-${index}" aria-describedby="addon-versions-${index}" value="${item.history.length > 0 ? `Versões: ${item.history.length}` : `Não há versões`}" disabled>
                                </div>
                                <div class="input-group my-2">
                                    <span class="input-group-text" id="addon-version-${index}">
                                        <i class="icon-bullseye"></i>
                                    </span>
                                    <input type="text" class="form-control" id="input-version-${index}" placeholder="Version Actual..." aria-label="item-version-${index}" aria-describedby="addon-version-${index}" value="${item.version > 0 ? `Versão Atual: ${item.version}` : `-`}" disabled>
                                </div>
                                <div class="input-group my-2">
                                    <span class="input-group-text" id="addon-type-${index}">
                                        <i class="icon-cogs"></i>
                                    </span>
                                    <input type="text" class="form-control" placeholder="Type..." aria-label="item-type-${index}" aria-describedby="addon-type-${index}" value="${item.type}" disabled>
                                </div>
                                <div class="input-group my-2">
                                    <span class="input-group-text" id="addon-tag-${index}">
                                        <i class="icon-tag"></i>
                                    </span>
                                    <input type="text" class="form-control" id="input-item-tag-${index}" placeholder="Tag..." aria-label="item-tag-${index}" aria-describedby="addon-tag-${index}" value="${item.tag}" disabled>
                                </div>
                                <div class="input-group my-2">
                                    <span class="input-group-text" id="addon-assignees-${index}">
                                        <i class="icon-hands-helping"></i>
                                    </span>
                                    <input type="text" class="form-control" placeholder="Assignees..." aria-label="item-assignees-${index}" aria-describedby="addon-assignees-${index}" value="Procuradores: ${item.assignees.length}" disabled>
                                </div>
                                <div class="input-group my-2">
                                    <span class="input-group-text" id="addon-createdAt-${index}">
                                        <i class="icon-clock"></i>
                                    </span>
                                    <input type="text" class="form-control" placeholder="CreatedAt..." aria-label="item-createdAt-${index}" aria-describedby="addon-createdAt-${index}" value="Criado em: ${this.localeDateString(item.createdAt)}" disabled>
                                </div>
                                <div class="input-group my-2">
                                    <span class="input-group-text" id="addon-lastAccess-${index}">
                                        <i class="icon-clock"></i>
                                    </span>
                                    <input type="text" class="form-control" placeholder="LastAccess..." aria-label="item-lastAccess-${index}" aria-describedby="addon-lastAccess-${index}" value="Acessado em: ${this.localeDateString(item.lastAccess)}" disabled>
                                </div>
                                <div class="input-group my-2">
                                    <span class="input-group-text" id="addon-updated-${index}">
                                        <i class="icon-clock"></i>
                                    </span>
                                    <input type="text" class="form-control" placeholder="Updated..." aria-label="item-updated-${index}" aria-describedby="addon-updated-${index}" value="Atualizado em: ${this.localeDateString(item.updated)}" disabled>
                                </div>
                                <div class="text-center border-top my-2 p-2">
                                    <button type="button" class="btn btn-outline-success col-12 my-1" id="upload-file-${index}">
                                        <i class="icon-file-upload me-2"></i> Atualizar
                                    </button>
                                    <button type="button" class="btn btn-outline-primary col-12 my-1" id="download-actual-version-${index}" ${item.version <= 0 ? 'disabled' : ''}>
                                        <i class="icon-file-download me-2"></i> Baixar
                                    </button>
                                    <button type="button" class="btn btn-primary col-12" id="btn-history-versions-${index}" ${item.history.length <= 0 ? 'disabled' : ''}>
                                        <i class="icon-history me-2"></i> Histórico de versões
                                    </button>
                                </div>
                            </div>
                            <div class="tab-pane fade py-2" id="tab-whitelist-${index}" role="tabpanel" aria-labelledby="tab-whitelist-label-${index}">
                                <ul class="list-group" id="list-whitelist-${index}">
                                </ul>
                                <div class="text-center border-top mt-2 p-2">
                                    <button type="button" class="btn btn-primary" id="btn-whitelist-append-${index}" data-bs-dismiss="offcanvas" aria-label="Close">Adicionar</button>
                                    <button type="button" class="btn btn-danger" id="btn-whitelist-remove-${index}" disabled>Remover</button>
                                </div>
                            </div>
                            <div class="tab-pane fade py-2" id="tab-assignees-${index}" role="tabpanel" aria-labelledby="tab-assignees-label-${index}">
                                <ul class="list-group" id="list-assignees-${index}">
                                </ul>
                                <div class="text-center border-top my-2 p-2">
                                    <button type="button" class="btn btn-primary">Adicionar</button>
                                    <button type="button" class="btn btn-danger" disabled>Remover</button>
                                </div>
                            </div>
                            <div class="text-center border-top my-2 p-2">
                                <button type="button" class="btn btn-outline-primary col-12 my-1 disabled" id="btn-move-item-for-${index}">
                                Mover para <i class="icon-chevron-circle-right ms-2"></i>
                                </button>
                                <button type="button" class="btn btn-primary col-12 my-1" data-bs-dismiss="offcanvas" aria-label="Close">
                                    <i class="icon-chevron-circle-left me-2"></i> Voltar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                `);

            $(`#upload-file-${index}`)
                .on('click', () => {
                    const
                        updateItem = this.getCacheItem(item.cid),
                        offcanvas = bootstrap.Offcanvas.getOrCreateInstance($(`#offcanvas-information-${index}`)),
                        modal = bootstrap.Modal.getOrCreateInstance($(`#modal_new_file`));

                    $('#new-file-name').val(updateItem.name);
                    $('#new-file-tag').val(updateItem.tag);
                    $('#new-file-description').val(updateItem.description);

                    $("#new-file-name").trigger('change');

                    this.cache_list_replaceAll('updateFile', true);
                    this.cache_list_replaceAll('updateFileCid', item.cid);
                    this.cache_list_replaceAll('updateFileType', item.type);
                    this.cache_list_replaceAll('updateFileFullName', `${item.name}${item.type}`);

                    if (offcanvas) {
                        $(`#modal_new_file`)
                            .on('hidden.bs.modal', (event) => {
                                if (Controller.offCanvasReopen[item.cid])
                                    offcanvas.show();

                                this.cache_list_replaceAll('updateFile', false);
                                Controller.offCanvasReopen[item.cid] = null;
                            });

                        offcanvas.hide();
                    };

                    if (modal) {
                        Controller.offCanvasReopen[item.cid] = true;

                        modal.show();
                    };
                });

            $(`#btn-history-versions-${index}`)
                .on('click', () => {
                    const
                        offcanvasInformation = bootstrap.Offcanvas.getOrCreateInstance($(`#offcanvas-information-${index}`)),
                        offcanvasDownloadVersions = bootstrap.Offcanvas.getOrCreateInstance($(`#offcanvas-download-versions-${index}`));

                    if (offcanvasInformation && offcanvasDownloadVersions) {
                        offcanvasInformation.hide();
                        offcanvasDownloadVersions.show();

                        Controller.offCanvasReopen[item.cid] = true;

                        $(`#offcanvas-download-versions-${index}`)
                            .on('hidden.bs.offcanvas', (event) => {
                                if (Controller.offCanvasReopen[item.cid])
                                    offcanvasInformation.show();

                                Controller.offCanvasReopen[item.cid] = null;
                            });
                    };
                });
        } else if (type === 'folder') {
            $(this.layerMain)
                .append(`
                <div class="offcanvas offcanvas-end" tabindex="-1" data-bs-backdrop="true" id="offcanvas-information-${index}" aria-labelledby="offcanvas-information-label-${index}">
                    <div class="offcanvas-header bg-primary bg-gradient text-secondary fw-bold border-bottom">
                        <h5 class="offcanvas-title" id="offcanvas-information-label-${index}">Sobre</h5>
                        <button type="button" class="btn-close btn-close-white text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                    </div>
                    <div class="offcanvas-body small">
                        <ul class="nav nav-tabs" id="tab-information-${index}" role="tablist">
                            <li class="nav-item col-12 col-md-6" role="presentation">
                                <button class="nav-link col-12 active text-primary text-truncate fw-bold" id="tab-info-label-${index}" data-bs-toggle="tab" data-bs-target="#tab-info-${index}" type="button" role="tab" aria-controls="tab-info-${index}" aria-selected="true">
                                    <i class="icon-info-circle me-2"></i> Info.
                                </button>
                            </li>
                            <li class="nav-item col-12 col-md-6" role="presentation">
                                <button class="nav-link col-12 text-primary text-truncate fw-bold" id="tab-whitelist-label-${index}" data-bs-toggle="tab" data-bs-target="#tab-whitelist-${index}" type="button" role="tab" aria-controls="tab-whitelist-${index}" aria-selected="false">
                                    <i class="icon-clipboard-list me-2"></i> Whitelist.
                                </button>
                            </li>
                            <li class="nav-item col-12 col-md-6" role="presentation">
                                <button class="nav-link col-12 text-primary text-truncate fw-bold" id="tab-assignees-label-${index}" data-bs-toggle="tab" data-bs-target="#tab-assignees-${index}" type="button" role="tab" aria-controls="tab-assignees-${index}" aria-selected="false">
                                    <i class="icon-hands-helping me-2"></i> Procuradores.
                                </button>
                            </li>
                        </ul>
                        <div class="tab-content" id="tab-content-information-${index}">
                            <div class="tab-pane fade show active py-2" id="tab-info-${index}" role="tabpanel" aria-labelledby="tab-info-label-${index}">
                                <div class="input-group">
                                    <span class="input-group-text" id="addon-name-${index}">
                                        <i class="icon-folder"></i>
                                    </span>
                                    <input type="text" class="form-control" placeholder="Name..." aria-label="item-name-${index}" aria-describedby="addon-name-${index}" value="${item.name}" disabled>
                                </div>
                                <div class="form-floating my-2">
                                    <textarea class="form-control" placeholder="Descrição..." id="floating-textarea-description-${index}" style="height: 100px" disabled>${item.description}</textarea>
                                    <label for="floating-textarea-description-${index}">Descrição</label>
                                </div>
                                <div class="input-group my-2">
                                    <span class="input-group-text" id="addon-type-${index}">
                                        <i class="icon-cogs"></i>
                                    </span>
                                    <input type="text" class="form-control" placeholder="Type..." aria-label="item-type-${index}" aria-describedby="addon-type-${index}" value="${item.type}" disabled>
                                </div>
                                <div class="input-group my-2">
                                    <span class="input-group-text" id="addon-tag-${index}">
                                        <i class="icon-tag"></i>
                                    </span>
                                    <input type="text" class="form-control" placeholder="Tag..." aria-label="item-tag-${index}" aria-describedby="addon-tag-${index}" value="${item.tag}" disabled>
                                </div>
                                <div class="input-group my-2">
                                    <span class="input-group-text" id="addon-files-${index}">
                                        <i class="icon-file"></i>
                                    </span>
                                    <input type="text" class="form-control" placeholder="Files..." id="item-count-files-${index}" aria-label="item-files-${index}" aria-describedby="addon-files-${index}" value="Arquivos: ${item.filesId.length}" disabled>
                                </div>
                                <div class="input-group my-2">
                                    <span class="input-group-text" id="addon-folders-${index}">
                                        <i class="icon-folder"></i>
                                    </span>
                                    <input type="text" class="form-control" placeholder="Folders..." id="item-count-folders-${index}" aria-label="item-folders-${index}" aria-describedby="addon-folders-${index}" value="Pastas: ${item.foldersId.length}" disabled>
                                </div>
                                <div class="input-group my-2">
                                    <span class="input-group-text" id="addon-assignees-${index}">
                                        <i class="icon-hands-helping"></i>
                                    </span>
                                    <input type="text" class="form-control" placeholder="Assignees..." aria-label="item-assignees-${index}" aria-describedby="addon-assignees-${index}" value="Procuradores: ${item.assignees.length}" disabled>
                                </div>
                                <div class="input-group my-2">
                                    <span class="input-group-text" id="addon-createdAt-${index}">
                                        <i class="icon-clock"></i>
                                    </span>
                                    <input type="text" class="form-control" placeholder="CreatedAt..." aria-label="item-createdAt-${index}" aria-describedby="addon-createdAt-${index}" value="Criado em: ${this.localeDateString(item.createdAt)}" disabled>
                                </div>
                                <div class="input-group my-2">
                                    <span class="input-group-text" id="addon-lastAccess-${index}">
                                        <i class="icon-clock"></i>
                                    </span>
                                    <input type="text" class="form-control" placeholder="LastAccess..." aria-label="item-lastAccess-${index}" aria-describedby="addon-lastAccess-${index}" value="Acessado em: ${this.localeDateString(item.lastAccess)}" disabled>
                                </div>
                                <div class="input-group my-2">
                                    <span class="input-group-text" id="addon-updated-${index}">
                                        <i class="icon-clock"></i>
                                    </span>
                                    <input type="text" class="form-control" placeholder="Updated..." aria-label="item-updated-${index}" aria-describedby="addon-updated-${index}" value="Atualizado em: ${this.localeDateString(item.updated)}" disabled>
                                </div>
                            </div>
                            <div class="tab-pane fade py-2" id="tab-whitelist-${index}" role="tabpanel" aria-labelledby="tab-whitelist-label-${index}">
                                <ul class="list-group" id="list-whitelist-${index}">
                                </ul>
                                <div class="text-center border-top my-2 p-2">
                                    <button type="button" class="btn btn-primary" id="btn-whitelist-append-${index}" data-bs-dismiss="offcanvas" aria-label="close">Adicionar</button>
                                    <button type="button" class="btn btn-danger" id="btn-whitelist-remove-${index}" disabled>Remover</button>
                                </div>
                            </div>
                            <div class="tab-pane fade py-2" id="tab-assignees-${index}" role="tabpanel" aria-labelledby="tab-assignees-label-${index}">
                                <ul class="list-group" id="list-assignees-${index}">
                                </ul>
                                <div class="text-center border-top my-2 p-2">
                                    <button type="button" class="btn btn-primary">Adicionar</button>
                                    <button type="button" class="btn btn-danger" disabled>Remover</button>
                                </div>
                            </div>
                            <div class="text-center border-top my-2 p-2">
                                <button type="button" class="btn btn-outline-primary col-12 my-1" id="btn-open-folder-${index}" data-bs-dismiss="offcanvas" aria-label="Close" ${item.filesId.length > 0 || item.foldersId.length > 0 ? '' : 'disabled'}>
                                    <i class="icon-folder-open me-2"></i> Abrir
                                </button>
                                <button type="button" class="btn btn-outline-primary col-12 my-1 disabled" id="btn-move-item-for-${index}">
                                Mover para <i class="icon-chevron-circle-right ms-2"></i>
                                </button>
                                <button type="button" class="btn btn-primary col-12 my-1" data-bs-dismiss="offcanvas" aria-label="Close">
                                    <i class="icon-chevron-circle-left me-2"></i> Voltar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                `);

            $(`#btn-open-folder-${index}`)
                .on('click', () => this.handleOpenFolder(item));
        };

        $(`#btn-move-item-for-${index}`)
            .on('click', () => {
                const
                    offcanvasInformation = bootstrap.Offcanvas.getOrCreateInstance($(`#offcanvas-information-${index}`)),
                    offcanvasMoveItemFor = bootstrap.Offcanvas.getOrCreateInstance($(`#offcanvas-move-item-for-${index}`));

                if (offcanvasInformation && offcanvasMoveItemFor) {
                    offcanvasInformation.hide();
                    offcanvasMoveItemFor.show();

                    Controller.offCanvasReopen[item.cid] = true;

                    $(`#offcanvas-move-item-for-${index}`)
                        .on('hidden.bs.offcanvas', (event) => {
                            if (Controller.offCanvasReopen[item.cid])
                                offcanvasInformation.show();

                            Controller.offCanvasReopen[item.cid] = null;
                        });
                };
            });
    };

    static handleOpenFolder(folder) {
        if (!folder.folderId)
            return window.app.hercules_openFolder(folder.name, folder.cid);
        else
            return window.app.hercules_openFolder(folder.name, folder.cid, {
                name: this.folderName,
                cid: folder.folderId
            });
    };

    static drawWhitelistGroup(index, group) {
        let
            i = this.cache_list_getter(`list-whitelist-${index}-iterator`) || 1,
            itemId = `item-whitelist-${index}-${group.name}`,
            permissions = group.permissions
                .join(',')
                .replaceAll(',', '<br />')
                // Folder
                .replace('Append', '- Adicionar/Remover conteúdo da pasta.')
                // File
                .replace('Write', '- Escrever/Remover conteúdo do arquivo.')
                .replace('Read', '- Ler o conteúdo.')
                // All
                .replace('Delete', '- Colocar o arquivo e/ou pasta na lixeira.')
                .replace('Protect', '- Proteger o arquivo e/ou pasta.')
                .replace('Share', '- Compartilhar o conteúdo.')
                .replace('Security', '- Adicionar/Remover grupos e/ou usuários da whitelist.')
                .replace('Block', '- Bloquear o conteúdo.');

        $(`#list-whitelist-${index}`)
            .append(`
            <li class="list-group-item bg-primary bg-gradient text-secondary fw-bold p-2 my-1" id="${itemId}">
                <input class="form-check-input me-1" type="checkbox" id="select-whitelist-${index}-${group.name}" value="${group.name}" aria-label="select-group" ${group.name === 'administrador' || group.name === 'supervisor' || group.name === 'moderador' ? 'disabled' : ''}>
                ${i}. ${group.name} <br />
                O grupo tem as seguintes permissões: <br />
                ${permissions}
            </li>
            `);

        $(`#select-whitelist-${index}-${group.name}`)
            .on('click', () => {
                const
                    key = `whitelist-items-${index}`,
                    value = compressToEncodedURIComponent(JSON.stringify({
                        id: `${itemId}`,
                        type: 'group',
                        groupName: group.name
                    })),
                    cache = this.cache_list_getter(key);

                let length = cache.length;

                if (!cache || cache && cache.indexOf(value) === -1) {
                    this.cache_list_setter(key, value);

                    length++;

                    $(`#btn-whitelist-remove-${index}`).attr('disabled', false);
                }
                else {
                    this.cache_list_remove(key, value);

                    length--;

                    if (length <= 0)
                        $(`#btn-whitelist-remove-${index}`).attr('disabled', true);
                };
            });

        this.cache_list_update(`list-whitelist-${index}-iterator`, ++i);
    };

    static async drawWhitelistUser(index, authorId, user) {
        const { email } = await window.app.storage_get_userInfo(),
            authorEmail = await window.app.getUserEmail(authorId);

        let
            i = this.cache_list_getter(`list-whitelist-${index}-iterator`) || 1,
            citerator = String(user.email).replace(/[\@,\.]/g, ''),
            itemId = `item-whitelist-${index}-${citerator}`,
            permissions = user.permissions
                .join(',')
                .replaceAll(',', '<br />')
                // Folder
                .replace('Append', '- Escrever/Remover dados na pasta.')
                // File
                .replace('Write', '- Escrever/Remover dados no arquivo.')
                // All
                .replace('Read', '- Ler o conteúdo.')
                .replace('Delete', '- Colocar o arquivo e/ou pasta na lixeira.')
                .replace('Protect', '- Proteger o arquivo e/ou pasta.')
                .replace('Share', '- Compartilhar o conteúdo.')
                .replace('Security', '- Adicionar/Remover grupos e/ou usuários da whitelist.')
                .replace('Block', '- Bloquear o conteúdo.');

        const
            disabled = email === user.email || authorEmail === user.email ? true : false,
            text = email !== user.email && authorEmail === user.email ? `Autor (${user.email})` : email === user.email ? `Você (${user.email})` : `${user.email}`;

        $(`#list-whitelist-${index}`)
            .append(`
            <li class="list-group-item bg-primary bg-gradient text-secondary fw-bold p-2 my-1" id="${itemId}">
                <input class="form-check-input me-1" type="checkbox" id="select-whitelist-${index}-${citerator}" value="${user.email}" aria-label="select-email" ${disabled ? 'disabled' : ''}>
                ${i}. ${text} <br />
                O usuário tem as seguintes permissões: <br />
                ${permissions}
            </li>
            `);

        if (!disabled)
            $(`#select-whitelist-${index}-${citerator}`)
                .on('click', () => {
                    const
                        key = `whitelist-items-${index}`,
                        value = compressToEncodedURIComponent(JSON.stringify({
                            id: `${itemId}`,
                            type: 'user',
                            userEmail: user.email
                        })),
                        cache = this.cache_list_getter(key);

                    let length = cache.length;

                    if (!cache || cache && cache.indexOf(value) === -1) {
                        this.cache_list_setter(key, value);

                        length++;

                        $(`#btn-whitelist-remove-${index}`).attr('disabled', false);
                    }
                    else {
                        this.cache_list_remove(key, value);

                        length--;

                        if (length <= 0)
                            $(`#btn-whitelist-remove-${index}`).attr('disabled', true);
                    };
                });

        this.cache_list_update(`list-whitelist-${index}-iterator`, ++i);
    };

    static async changeWithPrivilege(index, item, status) {
        const
            isRead = JSON.parse(await this.getUserPermission(item, 'Read')),
            isSecurity = JSON.parse(await this.getUserPermission(item, 'Security'));

        if (status === 'available') {
            if (!isRead) {
                this.disableButton(`#btn-history-versions-${index}`);
                this.disableButton(`#download-actual-version-${index}`);
            } else {
                if (item.history.length > 0) {
                    this.enableButton(`#btn-history-versions-${index}`);
                } else {
                    this.disableButton(`#btn-history-versions-${index}`);
                };

                if (item.version > 0) {
                    this.enableButton(`#download-actual-version-${index}`);
                } else {
                    this.disableButton(`#download-actual-version-${index}`);
                };
            };

            if (!isSecurity) {
                this.disableButton(`#btn-whitelist-append-${index}`);
                this.disableButton(`#item-delete-${index}`);

                if ($(`#list-whitelist-${index}`))
                    for (const whitelistItem of $(`#list-whitelist-${index}`).children()) {
                        const input = $(whitelistItem).find("input")[0];

                        if (this.privileges().forEach(privilege => {
                            var regex = new RegExp(privilege, "gi");

                            if (!$(whitelistItem).text().match(regex)) {
                                if (input)
                                    $(input).attr('disabled', true);
                            };
                        }));
                    };
            };
        } else if (status === 'trash') {
            if (!isSecurity) {
                this.disableButton(`#file-recovery-${index}`);
            };
        };
    };

    static remove_items = {};

    static deleteItem(index, type, item) {
        const
            itemID = `#item-delete-${index}`,
            key = `#container-item-${index}`;

        $(itemID).on('click', function () {
            const remove = $(this).is(':checked');

            if (remove) {
                Controller.cache_list_setter(key, item.cid);

                Controller.remove_items[key] = {
                    key: itemID,
                    cid: item.cid,
                    type,
                    name: item.name
                };

                $(`#list-remove-items`)
                    .append(`
                    <li class="list-group-item my-1 bg-primary bg-gradient text-secondary text-truncate fw-bold" id="list-item-${index}">
                    ${type === 'folder' ? `
                    <i class="icon-folder me-2"></i> ${item.name}
                    ` : `
                    <i class="icon-file me-2"></i> ${item.name}${item.type}
                    `}
                    </li>
                    `);
            } else {
                Controller.cache_list_remove(key, item.cid);

                Controller.remove_items[key] = null;

                $(`#list-item-${index}`)
                    .fadeOut('fast', function () { $(this).remove(); });
            };

            if (Object.values(Controller.remove_items).filter(item => item !== null).length > 0) {
                $('#button-actions-remove').attr('disabled', false);
            } else {
                $('#button-actions-remove').attr('disabled', true);
            };
        });
    };

    static async confirmRemoveItems() {
        const
            items = Object.keys(this.remove_items),
            values = Object.values(this.remove_items);

        if (items.length <= 0)
            return window.app.alerting(`Nenhum item está selecionado para ser enviado a lixeira.`);

        $("#btn-confirm-remove-items")
            .attr('disabled', true)
            .html(`
            <div class="spinner-border text-secondary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            `);

        this.drawStatusSteps();
        this.drawStep('move-to-trash', 'Movendo os itens para a lixeira...');

        this.cache_list_replaceAll('trash-items-length', items.length);
        for (const [i, item] of items.entries()) {
            const
                { key, cid, type, name } = values[i],
                permission = await this.getUserPermission(this.getCacheItem(cid), 'Delete');

            this.broadcast('ITEM-BUSY', compressToEncodedURIComponent(cid));

            setTimeout(() => {
                this.drawStep(`move-to-trash-${key.replace('#', '')}`, `
                ${type === 'folder' ? `
                Movendo a pasta: ${name}
                `: `
                Movendo o arquivo: ${name}
                `}
                `);

                this.emit('MOVE-TO-TRASH',
                    compressToEncodedURIComponent(cid),
                    compressToEncodedURIComponent(permission),
                    compressToEncodedURIComponent(type),
                    compressToEncodedURIComponent(key)
                );
            }, this.delayStep);
        };
    };

    static insertWhiteList(index, type, cid, access) {
        $(this.layerMain)
            .append(`
            <div class="modal fade" id="modal_insert_whitelist_${index}" tabindex="-1" data-bs-keyboard="true" aria-labelledby="modal_insert_whitelist_title_${index}" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                    <div class="modal-content">
                        <div class="modal-header bg-primary bg-gradient text-secondary fw-bold">
                            <h5 class="modal-title" id="modal_insert_whitelist_title_${index}">
                            Adicionar novo grupo/usuário na whitelist
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <ul class="nav nav-tabs" id="tab_insert_whitelist_${index}" role="tablist">
                                <li class="nav-item col-6" role="presentation" id="insert-whitelist-nav-tab-group-${index}">
                                    <button class="nav-link col-12 text-primary fw-bold active" id="tab_insert_whitelist_group_${index}" data-bs-toggle="tab" data-bs-target="#insert_whitelist_group_${index}" type="button" role="tab" aria-controls="insert_whitelist_group_${index}" aria-selected="true">
                                    <i class="icon-users me-2"></i> Grupo
                                    </button>
                                </li>
                                <li class="nav-item col-6" role="presentation" id="insert-whitelist-nav-tab-user-${index}">
                                    <button class="nav-link col-12 text-primary fw-bold" id="tab_insert_whitelist_user_${index}" data-bs-toggle="tab" data-bs-target="#insert_whitelist_user_${index}" type="button" role="tab" aria-controls="insert_whitelist_user_${index}" aria-selected="false">
                                    <i class="icon-user-friends me-2"></i> Usuário
                                    </button>
                                </li>
                            </ul>
                            <div class="tab-content" id="tab_content_insert_whitelist_${index}">
                                <div class="tab-pane fade show active" id="insert_whitelist_group_${index}" role="tabpanel" aria-labelledby="tab_insert_whitelist_group_${index}">
                                    <div class="input-group my-2">
                                        <span class="input-group-text" id="addon-insert-whitelist-group-name-${index}">
                                            <i class="icon-info-circle"></i>
                                        </span>
                                        <select class="form-select" aria-label="addon-insert-whitelist-group-name-${index}" id="insert-whitelist-select-${index}">
                                            ${this.appendWhiteListGroup(index, access)}
                                        </select>
                                    </div>
                                </div>
                                <div class="tab-pane fade" id="insert_whitelist_user_${index}" role="tabpanel" aria-labelledby="tab_insert_whitelist_user_${index}">
                                    <div class="input-group my-2">
                                        <span class="input-group-text" id="addon-insert-whitelist-group-email-${index}">
                                            <i class="icon-envelope"></i>
                                        </span>
                                        <input type="email" class="form-control" placeholder="Endereço de E-mail..." id="insert-whitelist-input-email-${index}" aria-label="addon-insert-whitelist-group-email-${index}" aria-describedby="addon-insert-whitelist-group-email-${index}" value="">
                                    </div>
                                </div>
                            </div>
                            <hr class="my-2">
                            <h5 class="text-muted fw-bold">
                            Permissões do grupo/usuário.
                            </h5>
                            <div class="d-flex flex-column my-1">
                                ${type === 'folder' ? `
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="switch-permission-file-write-${index}" checked>
                                    <label class="form-check-label" for="switch-permission-file-write-${index}">Adicionar/Remover</label>
                                </div>
                                ` : `
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="switch-permission-file-write-${index}" checked>
                                    <label class="form-check-label" for="switch-permission-file-write-${index}">Escrever</label>
                                </div>
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="switch-permission-file-read-${index}" checked>
                                    <label class="form-check-label" for="switch-permission-file-read-${index}">Ler</label>
                                </div>
                                `}
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="switch-permission-file-delete-${index}" checked>
                                    <label class="form-check-label" for="switch-permission-file-delete-${index}">Remover</label>
                                </div>
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="switch-permission-file-share-${index}" checked>
                                    <label class="form-check-label" for="switch-permission-file-share-${index}">Compartilhar</label>
                                </div>
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="switch-permission-file-protect-${index}" checked>
                                    <label class="form-check-label" for="switch-permission-file-protect-${index}">Proteger</label>
                                </div>
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="switch-permission-file-security-${index}" checked>
                                    <label class="form-check-label" for="switch-permission-file-security-${index}">Segurança</label>
                                </div>
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="switch-permission-file-block-${index}" checked>
                                    <label class="form-check-label" for="switch-permission-file-block-${index}">Bloqueio</label>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <a class="btn btn-outline-danger me-auto" href="${window.app.baseurl}/system/storage/hercules/help" target="_blank" role="button">
                            Precisa de ajuda?
                            </a>
                            <button type="button" class="btn btn-primary" id="btn-insert-whitelist-${index}" data-bs-dismiss="modal" disabled>
                            Atualizar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            `);

        $(`#btn-whitelist-append-${index}`).on("click", () => {
            const offcanvas = bootstrap.Offcanvas.getOrCreateInstance($(`#offcanvas-information-${index}`)),
                modal = bootstrap.Modal.getOrCreateInstance($(`#modal_insert_whitelist_${index}`));

            if (offcanvas) {
                offcanvas.hide();

                $(`#modal_insert_whitelist_${index}`)
                    .on('hidden.bs.modal', (event) => {
                        if (Controller.offCanvasReopen[item.cid])
                            offcanvas.show();

                        Controller.offCanvasReopen[item.cid] = null;
                    });
            };

            if (modal) {
                Controller.offCanvasReopen[item.cid] = true;

                modal.show();
            };
        });

        $(`#insert-whitelist-nav-tab-group-${index}`).on('click', function () {
            Controller.cache_list_replaceAll('whitelist-tab', 'group');

            if ($(`#insert-whitelist-select-${index}`).val() !== 'default')
                $(`#btn-insert-whitelist-${index}`).attr('disabled', false);
            else
                $(`#btn-insert-whitelist-${index}`).attr('disabled', true);
        });

        $(`#insert-whitelist-nav-tab-user-${index}`).on('click', function () {
            Controller.cache_list_replaceAll('whitelist-tab', 'user');

            if (window.app.input().isMail(`insert-whitelist-input-email-${index}`))
                $(`#btn-insert-whitelist-${index}`).attr('disabled', false);
            else
                $(`#btn-insert-whitelist-${index}`).attr('disabled', true);
        });

        Controller.cache_list_replaceAll('whitelist-tab', 'group');

        function update_btn_status() {
            if (
                $(`#insert-whitelist-select-${index}`).val() !== 'default' ||
                window.app.input().isMail(`insert-whitelist-input-email-${index}`)
            ) {
                $(`#btn-insert-whitelist-${index}`).attr('disabled', false);
            } else {
                $(`#btn-insert-whitelist-${index}`).attr('disabled', true);
            };
        };

        $(`#insert-whitelist-select-${index}, #insert-whitelist-input-email-${index}`).on({
            change: update_btn_status,
            keyup: update_btn_status
        });

        $(`#btn-insert-whitelist-${index}`)
            .on("click", async () => {
                let permissions = [];

                // Folder
                if (type === 'folder') {
                    if ($(`#switch-permission-file-write-${index}`).is(':checked'))
                        permissions.push('Append');
                }
                // File
                else if (type === 'file') {
                    if ($(`#switch-permission-file-write-${index}`).is(':checked'))
                        permissions.push('Write');
                    if ($(`#switch-permission-file-read-${index}`).is(':checked'))
                        permissions.push('Read');
                };
                // All
                if ($(`#switch-permission-file-delete-${index}`).is(':checked'))
                    permissions.push('Delete');
                if ($(`#switch-permission-file-share-${index}`).is(':checked'))
                    permissions.push('Share');
                if ($(`#switch-permission-file-protect-${index}`).is(':checked'))
                    permissions.push('Protect');
                if ($(`#switch-permission-file-security-${index}`).is(':checked'))
                    permissions.push('Security');
                if ($(`#switch-permission-file-block-${index}`).is(':checked'))
                    permissions.push('Block');

                if (permissions.length <= 0)
                    return window.app.alerting(`Nenhuma permissão habilitada. Por gentileza, habilite uma ou mais permissões.`);

                if (
                    this.cache_list_getter('whitelist-tab', 'group')
                ) {
                    const value = $(`#insert-whitelist-select-${index}`).val(),
                        item = this.getCacheItem(cid),
                        permission = await this.getUserPermission(item, 'Security');

                    if (value !== 'default' && value !== 'already-added') {
                        this.drawStatusSteps();
                        this.drawStep('whitelist-group-update', 'Adicionando o grupo a whitelist do arquivo...');

                        setTimeout(() => {
                            this.emit('WHITELIST-GROUP-UPDATE',
                                compressToEncodedURIComponent(cid),
                                compressToEncodedURIComponent(permission),
                                compressToEncodedURIComponent(type),
                                compressToEncodedURIComponent(value),
                                compressToEncodedURIComponent(JSON.stringify(permissions))
                            );
                        }, this.delayStep);
                    };
                } else if (
                    this.cache_list_getter('whitelist-tab', 'user')
                ) {
                    const value = $(`#insert-whitelist-input-email-${index}`).val(),
                        item = this.getCacheItem(cid),
                        permission = await this.getUserPermission(item, 'Security');

                    this.drawStatusSteps();
                    this.drawStep('whitelist-user-update', 'Adicionando o usuário a whitelist do arquivo...');

                    setTimeout(() => {
                        this.emit('WHITELIST-USER-UPDATE',
                            compressToEncodedURIComponent(cid),
                            compressToEncodedURIComponent(permission),
                            compressToEncodedURIComponent(type),
                            compressToEncodedURIComponent(value),
                            compressToEncodedURIComponent(JSON.stringify(permissions))
                        );
                    }, this.delayStep);
                };
            });
    };

    static async removeWhitelist(index, type, cid) {
        $(`#btn-whitelist-remove-${index}`)
            .on('click', async () => {
                const key = `whitelist-items-${index}`;

                let
                    group = {
                        itemsId: [],
                        groupsName: []
                    },
                    user = {
                        itemsId: [],
                        usersEmail: []
                    };

                for (const item of this.cache_list_getter(key)) {
                    const value = JSON.parse(decompressFromEncodedURIComponent(item));

                    if (value.type === 'group') {
                        group.itemsId.push(value.id);
                        group.groupsName.push(value.groupName);
                    } else if (value.type === 'user') {
                        user.itemsId.push(value.id);
                        user.usersEmail.push(value.userEmail);
                    };
                }

                this.drawStatusSteps();

                const
                    item = this.getCacheItem(cid),
                    permission = await this.getUserPermission(item, 'Security');

                if (group.groupsName.length > 0) {
                    this.drawStep('whitelist-group-remove', 'Removendo o grupo da whitelist do arquivo...');

                    setTimeout(() => {
                        this.emit('WHITELIST-GROUP-REMOVE',
                            compressToEncodedURIComponent(cid),
                            compressToEncodedURIComponent(permission),
                            compressToEncodedURIComponent(type),
                            compressToEncodedURIComponent(JSON.stringify(group.itemsId)),
                            compressToEncodedURIComponent(JSON.stringify(group.groupsName))
                        );
                    }, this.delayStep);
                };

                if (user.usersEmail.length > 0) {
                    this.drawStep('whitelist-user-remove', 'Removendo o usuário da whitelist do arquivo...');

                    setTimeout(() => {
                        this.emit('WHITELIST-USER-REMOVE',
                            compressToEncodedURIComponent(cid),
                            compressToEncodedURIComponent(permission),
                            compressToEncodedURIComponent(type),
                            compressToEncodedURIComponent(JSON.stringify(user.itemsId)),
                            compressToEncodedURIComponent(JSON.stringify(user.usersEmail))
                        );
                    }, this.delayStep);
                };
            });
    };

    static appendWhiteListGroup(index, access) {
        let list = `<option value="default" selected>Selecione um grupo</option>`;

        function groupExist(privilege) {
            return access.groups.filter(_group => _group.name === privilege).length > 0;
        };

        for (const privilege of this.privileges()) {
            if (!groupExist(privilege)) {
                list += `<option value="${privilege}" id="insert-whitelist-${index}-group-${privilege}">${privilege}</option>`;
            } else {
                list += `<option value="already-added" id="insert-whitelist-${index}-group-${privilege}" disabled>${privilege} (Já está adicionado)</option>`;
            };
        };

        return list;
    };

    static async drawButtonDownloadVersions(index, file) {
        $(this.layerMain)
            .append(`
            <div class="offcanvas offcanvas-end" tabindex="-1" data-bs-backdrop="true" id="offcanvas-download-versions-${index}" aria-labelledby="offcanvas-download-versions-label-${index}">
                <div class="offcanvas-header bg-primary bg-gradient text-secondary fw-bold border-bottom">
                    <h5 class="offcanvas-title" id="offcanvas-download-versions-label-${index}">Histórico de versões</h5>
                    <button type="button" class="btn-close btn-close-white text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </div>
                <div class="input-group mt-1 px-2">
                    <span class="input-group-text" id="addon-total-versions-${index}">
                        <i class="icon-code-branch"></i>
                    </span>
                    <input type="text" class="form-control" id="input-history-versions-length-${index}" placeholder="Total of versions..." aria-label="file-total-versions-${index}" aria-describedby="addon-total-versions-${index}" value="${file.history.length > 0 ? `Versões: ${file.history.length}` : `Não há versões`}" disabled>
                </div>
                <div class="input-group px-2">
                    <span class="input-group-text" id="addon-version-actual-${index}">
                        <i class="icon-bullseye"></i>
                    </span>
                    <input type="text" class="form-control" id="input-version-actual-${index}" placeholder="Version Actual..." aria-label="item-version-actual-${index}" aria-describedby="addon-version-actual-${index}" value="${file.version > 0 ? `Versão Atual: ${file.version}` : `-`}" disabled>
                </div>
                <div class="offcanvas-body py-1 my-1 small">
                    <div class="list-group" id="container-download-versions-${index}">
                    </div>
                </div>
                <div class="text-center my-1 p-2 border-top border-bottom">
                    <a class="btn btn-outline-primary col-12 disabled" id="download-multiples-versions-${index}">
                        <li class="icon-file-archive me-2"></li> Baixar Versões
                    </a>
                </div>
                <div class="my-2 p-2 col-12">
                    <p class="p-2 text-muted">O proprietário/procurador(es) e/ou grupo(s)/usuário(s) que tenham permissão de segurança poderão ver o conteúdo do pasta/arquivo.</p>
                    <a class="btn btn-outline-danger col-12" href="${window.app.baseurl}/system/storage/hercules/help" target="_blank" role="button">
                    Precisa de ajuda?
                    </a>
                </div>
                <div class="text-center border-top my-2 p-2">
                    <button type="button" class="btn btn-primary col-12 my-1" data-bs-dismiss="offcanvas" aria-label="Close">
                        <i class="icon-chevron-circle-left me-2"></i> Voltar
                    </button>
                </div>
            </div>
            `);

        const permission = await this.getUserPermission(file, 'Read');

        for (const history of file.history) {
            this.drawHistoryVersion(
                `Versão: ${history.version}`,
                history.version,
                file.name,
                file.type,
                file.cid,
                index,
                permission
            );
        };
    };

    static async drawHistoryVersion(title, version, filename, filetype, cid, index, permission) {
        let cache = this.cache_list_getter(`draw-history-versions-${index}`);

        if (cache instanceof Array === false) cache = [];

        if (!cache.includes(String(version))) {
            const
                { token } = await window.app.storage_get_userInfo();

            this.cache_list_setter(`draw-history-versions-${index}`, String(version));

            $(`#container-download-versions-${index}`)
                .prepend(`
                <div class="card my-2" id="container-history-version-${version}-${index}">
                    <div class="card-header bg-primary text-secondary fw-bold">
                        <div class="d-flex flex-row">
                            <p class="flex-grow-1 text-truncate my-2 fs-5">
                                <i class="icon-info-circle me-2"></i> ${title}
                            </p>
                            <div class="form-check form-switch my-2">
                                <input class="form-check-input" type="checkbox" id="select-version-for-multiple-download-${version}-${index}">
                                <label class="form-check-label" for="select-version-for-multiple-download-${version}-${index}">
                                Selecionar
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="card-body bg-light-gray">
                        <div class="text-center ms-2">
                            <a class="btn btn-outline-primary me-2" id="download-version-${version}-${index}" target="_blank" href="${window.app.baseurl}/system/storage/hercules/version/download/${filename}${filetype}.gz?cid=${compressToEncodedURIComponent(cid)}&permission=${compressToEncodedURIComponent(permission)}&version=${compressToEncodedURIComponent(version)}&usr_token=${token}">
                                <li class="icon-download me-2"></li> Baixar
                            </a>
                            <a class="btn btn-outline-danger me-2" id="delete-version-${version}-${index}">
                                <li class="icon-trash me-2"></li> Deletar
                            </a>
                        </div>
                    </div>
                </div>
                `);

            $(`#select-version-for-multiple-download-${version}-${index}`)
                .on('change', () => {
                    let cache = Controller.cache_list_getter(`history-versions-${index}`) || [];

                    if (
                        $(`#select-version-for-multiple-download-${version}-${index}`)
                            .is(':checked')
                    ) {
                        if (cache.filter(_version => _version === version).length <= 0)
                            cache.push(version);
                    } else {
                        if (cache.length > 0)
                            cache = cache.filter(_version => _version !== version);
                    };

                    if (cache.length > 0) {
                        if ($(`#download-multiples-versions-${index}`).hasClass('disabled'))
                            $(`#download-multiples-versions-${index}`).removeClass('disabled');
                    } else {
                        if (!$(`#download-multiples-versions-${index}`).hasClass('disabled'))
                            $(`#download-multiples-versions-${index}`).addClass('disabled');
                    };

                    Controller.cache_list_replaceAll(`history-versions-${index}`, cache);
                });

            $(`#delete-version-${version}-${index}`)
                .on("click", () => this.removeVersions(cid, [Number(version)]));
        };
    };

    static async handleButtonMoveItemFor(index, item, type) {
        let folders = [...this.folders];

        if (folders.length <= 0) {
            folders.push({
                name: 'Sem Vinculo',
                public: true
            });
        } else if (
            type === 'folder' && !item.folderId &&
            folders.filter(folder => folder.cid !== item.cid).length <= 0
        ) {
            return;
        } else {
            folders.unshift({
                name: 'Sem Vinculo',
                public: true
            });
        };

        $(`#btn-move-item-for-${index}`).removeClass('disabled');

        $(this.layerMain)
            .append(`
            <div class="offcanvas offcanvas-end" tabindex="-1" data-bs-backdrop="true" id="offcanvas-move-item-for-${index}" aria-labelledby="offcanvas-move-item-for-label-${index}">
                <div class="offcanvas-header bg-primary bg-gradient text-secondary fw-bold border-bottom">
                    <h5 class="offcanvas-title" id="offcanvas-move-item-for-label-${index}">Mova o arquivo/pasta para...</h5>
                    <button type="button" class="btn-close btn-close-white text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </div>
                <div class="offcanvas-body px-2">
                    <div class="input-group">
                        <span class="input-group-text" id="addon-name-item-${index}">
                            <i class="icon-info-circle"></i>
                        </span>
                        <input type="text" class="form-control" id="input-name-item-${index}" placeholder="Name of item..." aria-label="name-item-${index}" aria-describedby="addon-name-item-${index}" value="${type === 'file' ? `${item.name}${item.type}` : `${item.name}`}" disabled>
                    </div>
                    <div class="form-floating my-1">
                        <textarea class="form-control" placeholder="Descrição..." id="floating-textarea-description-${index}" style="height: 100px" disabled>${item.description}</textarea>
                        <label for="floating-textarea-description-${index}">Descrição</label>
                    </div>
                    <div class="input-group my-1">
                        <span class="input-group-text" id="addon-help-action-${index}">
                            <i class="icon-question-circle"></i>
                        </span>
                        <input type="text" class="form-control" id="input-help-action-${index}" placeholder="Help Action..." aria-label="help-action-${index}" aria-describedby="addon-help-action-${index}" value="${type === 'file' ? `Mova o arquivo para uma das pastas a baixo` : `Mova a pasta para uma das pastas a baixo`}" disabled>
                    </div>
                    <div class="list-group" id="container-move-item-for-folder-${index}" style="height: 100px;">
                    </div>
                </div>
                <div class="text-center my-1 p-2 border-top border-bottom">
                    <a class="btn btn-outline-primary col-12 disabled" id="confirm-move-item-for-folder${index}" data-bs-dismiss="offcanvas" aria-label="Close">
                        <li class="icon-check-circle me-2"></li> Confirmar
                    </a>
                </div>
                <div class="my-2 p-2 col-12">
                    <p class="p-2 text-muted">O proprietário/procurador(es) e/ou grupo(s)/usuário(s) que tenham permissão de segurança poderão ver o conteúdo do pasta/arquivo.</p>
                    <a class="btn btn-outline-danger col-12" href="${window.app.baseurl}/system/storage/hercules/help" target="_blank" role="button">
                    Precisa de ajuda?
                    </a>
                </div>
                <div class="text-center border-top my-2 p-2">
                    <button type="button" class="btn btn-primary col-12 my-1" data-bs-dismiss="offcanvas" aria-label="Close">
                        <i class="icon-chevron-circle-left me-2"></i> Voltar
                    </button>
                </div>
            </div>
            `);

        for (const folder of folders) {
            if (!folder.public) {
                if (type === 'folder' && item.cid === folder.cid)
                    continue;

                $(`#container-move-item-for-folder-${index}`)
                    .append(`
                    <button type="button" class="btn btn-outline-primary btn-sm mt-1" id="btn-move-item-for-folder-${folder.name.replace(/\s{1,}/g, '-')}-${index}" ${item.folderId === folder.cid ? 'disabled' : ''}>
                        <i class="icon-folder me-2"></i> ${folder.name} ${item.folderId === folder.cid ? '(Atual)' : ''}
                    </button>
                    `);
            } else {
                $(`#container-move-item-for-folder-${index}`)
                    .append(`
                    <button type="button" class="btn btn-outline-primary btn-sm mt-1" id="btn-move-item-for-folder-${folder.name.replace(/\s{1,}/g, '-')}-${index}" ${typeof item.folderId === 'undefined' ? 'disabled' : ''}>
                        <i class="icon-folder-open me-2"></i> ${folder.name} ${typeof item.folderId === 'undefined' ? '(Atual)' : ''}
                    </button>
                    `);
            };

            let buttonID = `#btn-move-item-for-folder-${folder.name.replace(/\s{1,}/g, '-')}-${index}`;

            $(buttonID)
                .on('click', function () {
                    let cache = Controller.cache_list_getter(`item-move-for-folder-${index}`);

                    if (cache instanceof Array) {
                        if (cache[0] !== buttonID) {
                            $(cache[0])
                                .removeClass('btn-primary')
                                .addClass('btn-outline-primary');

                            Controller.cache_list_replaceAll(`item-move-for-folder-${index}`, null);
                            $(`#confirm-move-item-for-folder${index}`).addClass('disabled');
                        };
                    };

                    if ($(this).hasClass('btn-outline-primary')) {
                        $(this)
                            .removeClass('btn-outline-primary')
                            .addClass('btn-primary');

                        Controller.cache_list_replaceAll(`item-move-for-folder-${index}`, [buttonID, folder]);
                        $(`#confirm-move-item-for-folder${index}`).removeClass('disabled');
                    } else {
                        $(this)
                            .removeClass('btn-primary')
                            .addClass('btn-outline-primary');

                        Controller.cache_list_replaceAll(`item-move-for-folder-${index}`, null);
                        $(`#confirm-move-item-for-folder${index}`).addClass('disabled');
                    };
                });
        };

        $(`#confirm-move-item-for-folder${index}`)
            .on('click', () => this.moveItemForFolder(index, item, type));
    };

    static reloadListMoveItemsFor() {
        const
            folders = [...this.folders],
            files = [...this.files],
            clear = (item, type) => {
                this.closeAllOffcanvasOfItem(item.cid);

                $(`#offcanvas-move-item-for-${item.index}`).remove();

                $(`#btn-move-item-for-${item.index}`).addClass('disabled');

                this.handleButtonMoveItemFor(item.index, item, type);

                if (type === 'folder') {
                    if (item.filesId.length > 0 || item.foldersId.length > 0) {
                        this.enableButton(`#btn-open-folder-${item.index}`);
                    } else {
                        this.disableButton(`#btn-open-folder-${item.index}`);
                    };

                    $(`#item-count-files-${item.index}`).val(`Arquivos: ${item.filesId.length}`);
                    $(`#item-count-folders-${item.index}`).val(`Pastas: ${item.foldersId.length}`);
                };
            };

        for (const folder of folders) {
            const item = this.getCacheItem(folder.cid);

            if (item) clear(item, 'folder');
        };

        for (const file of files) {
            const item = this.getCacheItem(file.cid);

            if (item) clear(item, 'file');
        };
    };

    /**
     * @description Método extendido
     */
    static async removeVersions(cid, versions) { };


    /**
     * @description Move o arquivo/pasta para uma pasta
     */
    static async moveItemForFolder(index, item, type) {
        let cache = Controller.cache_list_getter(`item-move-for-folder-${index}`);

        if (cache instanceof Array === false)
            return window.app.alerting(`Não é possivel mover o arquivo/pasta no momento. Tente novamente!`);

        this.drawStatusSteps();
        this.drawStep(
            `item-move-for-folder-${item.cid}`,
            `${type === 'folder' ? `
            Movendo a pasta "${item.name}" para a pasta "${cache[1].name}"
            ` : `
            Movendo o arquivo "${item.name}${item.type}" para a pasta "${cache[1].name}"
            `}`
        );

        this.offCanvasReopen[item.cid] = null;

        this.broadcast('ITEM-BUSY', compressToEncodedURIComponent(item.cid));

        const folder = cache[1];

        if (type === 'file') {
            if (!folder.public) {
                const
                    permissionFolder = await this.getUserPermission(folder, 'Append'),
                    permissionFile = await this.getUserPermission(item, 'Write');

                setTimeout(() => {
                    this.emit('MOVE-FILE-FOR-FOLDER',
                        compressToEncodedURIComponent(item.cid), // FileId
                        compressToEncodedURIComponent(folder.cid), // FolderId
                        compressToEncodedURIComponent(permissionFolder),
                        compressToEncodedURIComponent(permissionFile)
                    );
                }, this.delayStep);
            } else {
                const
                    permission = await this.getUserPermission(item, 'Delete');

                setTimeout(() => {
                    this.emit('MOVE-FILE-FOR-PUBLIC',
                        compressToEncodedURIComponent(item.cid),
                        compressToEncodedURIComponent(permission)
                    );
                }, this.delayStep);
            };
        } else if (type === 'folder') {
            if (!folder.public) {
                const
                    permission = await this.getUserPermission(folder, 'Append');

                setTimeout(() => {
                    this.emit('MOVE-FOLDER-FOR-FOLDER',
                        compressToEncodedURIComponent(item.cid), // Secondary FolderId
                        compressToEncodedURIComponent(folder.cid), // Primary FolderId
                        compressToEncodedURIComponent(permission)
                    );
                }, this.delayStep);
            } else {
                const
                    permission = await this.getUserPermission(item, 'Append');

                setTimeout(() => {
                    this.emit('MOVE-FOLDER-FOR-PUBLIC',
                        compressToEncodedURIComponent(item.cid),
                        compressToEncodedURIComponent(permission)
                    );
                }, this.delayStep);
            };
        };
    };

    /**
     * @description Evento do botão para baixar a versão atual do arquivo
     */
    static async handleButtonDownloadActualVersion(index, file) {
        $(`#download-actual-version-${index}`)
            .on("click", async () => {
                const
                    { token } = await window.app.storage_get_userInfo(),
                    permission = await this.getUserPermission(file, 'Read'),
                    link = `${window.app.baseurl}/system/storage/hercules/version/download/${file.name}${file.type}.gz?cid=${compressToEncodedURIComponent(file.cid)}&permission=${compressToEncodedURIComponent(permission)}&version=${compressToEncodedURIComponent(file.version)}&usr_token=${token}`;

                return window.open(link, '_blank');
            });
    };

    /**
     * @description Evento do botão para baixar a versão atual do arquivo
     */
    static async handleButtonDownloadMultiplesVersions(index, file) {
        $(`#download-multiples-versions-${index}`)
            .on("click", async () => {
                const
                    { token } = await window.app.storage_get_userInfo(),
                    permission = await this.getUserPermission(file, 'Read'),
                    versions = this.cache_list_getter(`history-versions-${index}`) || [];

                if (versions.length <= 0)
                    return window.app.alerting(`Seleciona uma e/ou mais versões que deseja baixar.`);

                const link = `${window.app.baseurl}/system/storage/hercules/versions/download/${file.name}.gz?cid=${compressToEncodedURIComponent(file.cid)}&permission=${compressToEncodedURIComponent(permission)}&versions=${compressToEncodedURIComponent(JSON.stringify(versions))}&usr_token=${token}`;

                return window.open(link, '_blank');
            });
    };

    /**
     * @description Composição quando o item está na lixeira
     */
    static drawTrashState(item, type, first) {
        const index = this.index();

        this.drawFirstItem(first, this.layerTrash, index, item, type, 'trash');
        this.hoverShadow(`#container-item-${index}`, 'trash');
        this.tooltip(`#container-item-${index}`);

        $(this.layerMain)
            .append(`
            <div class="offcanvas offcanvas-end" tabindex="-1" data-bs-backdrop="true" id="offcanvas-information-${index}" aria-labelledby="offcanvas-information-label-${index}">
                <div class="offcanvas-header bg-danger bg-gradient text-white fw-bold border-bottom">
                    <h5 class="offcanvas-title" id="offcanvas-information-label-${index}">Lixeira</h5>
                    <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </div>
                <p class="my-2 p-2 text-muted">
                ${type === 'folder' ? `A pasta` : `O arquivo`} ficará na lixeira por ${this.trashDays()} dia(s).
                </p>
                <div class="offcanvas-body border-top border-bottom small">
                    <div class="d-flex flex-column col-12 p-2">
                        <div class="input-group flex-nowrap">
                            <span class="input-group-text" id="addon-trash-file-name-${index}">
                                <i class="icon-info-circle"></i>
                            </span>
                            <input type="text" class="form-control" placeholder="Nome do Arquivo..." aria-label="file-name" aria-describedby="addon-trash-file-name-${index}" readonly>
                        </div>
                        ${type === 'folder' ? `
                        <input class="form-control" type="text" value="${item.name}" aria-label="file-name" readonly>
                        ` : `
                        <input class="form-control" type="text" value="${item.name}${item.type}" aria-label="file-name" readonly>
                        `
                }
                    </div>
                    <div class="d-flex flex-column col-12 p-2">
                        <div class="input-group flex-nowrap">
                            <span class="input-group-text" id="addon-trash-date-remove-${index}">
                                <i class="icon-calendar-times"></i>
                            </span>
                            <input type="text" class="form-control" placeholder="Data prevista de remoção" aria-label="date-trash" aria-describedby="addon-trash-date-remove-${index}" readonly>
                        </div>
                        <input class="form-control" type="text" value="${this.localeDateString(item.trash)}" aria-label="data-trash" readonly>
                    </div>
                    <div class="d-flex flex-column col-12 p-2">
                        <button type="button" class="btn btn-outline-success col-12" id="file-recovery-${index}" data-bs-dismiss="offcanvas" aria-label="Close">Recuperar</button>
                    </div>
                </div>
                <div class="my-2 p-2 col-12">
                    <p class="p-2 text-muted">O proprietário/procurador(es) e/ou grupo(s)/usuário(s) que tenham permissão de segurança poderão ver o conteúdo do pasta/arquivo.</p>
                    <a class="btn btn-outline-danger col-12" href="${window.app.baseurl}/system/storage/hercules/help" target="_blank" role="button">
                    Precisa de ajuda?
                    </a>
                </div>
                <div class="text-center border-top my-2 p-2">
                    <button type="button" class="btn btn-primary col-12 my-1" data-bs-dismiss="offcanvas" aria-label="Close">
                        <i class="icon-chevron-circle-left me-2"></i> Voltar
                    </button>
                </div>
            </div>
            `);

        this.setCacheItem(index, type, item);
        this.changeWithPrivilege(index, item, 'trash');
        this.recoveryTrash(index, type, item.cid);
    };

    static async recoveryTrash(index, type, cid) {
        const item = this.getCacheItem(cid);

        if (this.isAuthor(item) || this.isAssignee(item)) {
            $(`#file-recovery-${index}`)
                .on('click', async () => {
                    const item = this.getCacheItem(cid),
                        permission = await this.getUserPermission(item, 'Delete');

                    if (this.cidIsValid(item)) {
                        this.drawStatusSteps();
                        this.drawStep(`trash-recovery-${index}`, `
                        ${type === 'folder' ? `
                        Removendo a pasta(${item.name}) da lixeira...
                        ` : `
                        Removendo o arquivo(${item.name}) da lixeira...
                        `}
                        `);

                        this.broadcast('ITEM-BUSY', compressToEncodedURIComponent(item.cid));

                        setTimeout(() => {
                            this.emit('TRASH-RECOVERY',
                                compressToEncodedURIComponent(item.cid),
                                compressToEncodedURIComponent(permission),
                                compressToEncodedURIComponent(type),
                            );
                        }, this.delayStep);
                    };
                });
        } else {
            $(`#file-recovery-${index}`).attr('disabled', true);
        };
    };

    /**
     * @description Eventos
     */
    static events() {
        this.events_append();
        this.events_busy();
        this.events_whitelist();
        this.events_trash();
        this.events_file();
        this.events_folder();
    };

    static events_append() {
        this.on('APPEND-ITEM', (item, type) => {
            item = JSON.parse(decompressFromEncodedURIComponent(item));
            type = decompressFromEncodedURIComponent(type);

            if (type === 'folder') {
                this.folders.push(item);
            } else if (type === 'file') {
                this.files.push(item);
            };

            this.append(item, type, type === 'folder' ? true : false);
            this.reloadListMoveItemsFor();
        });
    };

    static events_busy() {
        this.on('ITEM-BUSY-HOLD', (cid) => {
            cid = decompressFromEncodedURIComponent(cid);

            const item = this.getCacheItem(cid);

            if (item) {
                if ($(`#item-delete-${item.index}`).is(':checked'))
                    $(`#item-delete-${item.index}`).trigger('click');

                $(`#container-item-${item.index}`)
                    .fadeOut('fast', function () {
                        $(this)
                            .off()
                            .replaceWith(Controller.divContainerItem(item.index, item, item.typeof, 'unavailable'))
                            .fadeIn('fast');
                    });

                this.closeAllOffcanvasOfItem(cid);
            };
        });

        this.on('ITEM-BUSY-RELEASE', (cid, status) => {
            cid = decompressFromEncodedURIComponent(cid);
            status = decompressFromEncodedURIComponent(status);

            const item = this.getCacheItem(cid);

            if (item) {
                $(`#container-item-${item.index}`)
                    .fadeOut('fast', function () {
                        $(this)
                            .off()
                            .replaceWith(Controller.divContainerItem(item.index, item, item.typeof, status))
                            .fadeIn('fast');

                        Controller.hoverShadow(`#container-item-${item.index}`, status);
                    });
            };
        });
    };

    static events_whitelist() {
        this.on('WHITELIST-GROUP-UPDATE-SUCCESS', (cid, value, group) => {
            cid = decompressFromEncodedURIComponent(cid);
            value = decompressFromEncodedURIComponent(value);
            group = JSON.parse(decompressFromEncodedURIComponent(group));

            const item = this.getCacheItem(cid),
                { index } = item;

            this.completeStep('whitelist-group-update');
            this.drawButtonsStep();

            $(`#insert-whitelist-${index}-group-${value}`)
                .attr('disabled', true)
                .text(`${group.name} (Já está adicionado)`);

            $(`#insert-whitelist-select-${index}`).val('default');
            $(`#btn-insert-whitelist-${index}`).attr('disabled', true);

            this.drawWhitelistGroup(index, group);
        });

        this.on('WHITELIST-GROUP-UPDATE-ERROR', (error) => {
            error = JSON.parse(decompressFromEncodedURIComponent(error));

            this.warningStep('whitelist-group-update');
            this.drawButtonsStep();

            this.drawDetailsSteps(`Ocorreu um erro na hora de adicionar o grupo na whitelist do arquivo, detalhes:`);
            this.drawDetailsSteps(JSON.stringify(error));

            console.log('WHITELIST-GROUP-UPDATE-ERROR', error);
        });

        this.on('WHITELIST-USER-UPDATE-SUCCESS', (cid, user) => {
            cid = decompressFromEncodedURIComponent(cid);
            user = JSON.parse(decompressFromEncodedURIComponent(user));

            const item = this.getCacheItem(cid),
                { index, authorId } = item;

            this.completeStep('whitelist-user-update');
            this.drawButtonsStep();

            $(`#insert-whitelist-input-email-${index}`).val('');
            $(`#btn-insert-whitelist-${index}`).attr('disabled', true);

            this.drawWhitelistUser(index, authorId, user);
        });

        this.on('WHITELIST-USER-UPDATE-ERROR', (error) => {
            error = JSON.parse(decompressFromEncodedURIComponent(error));

            this.warningStep('whitelist-user-update');
            this.drawButtonsStep();

            this.drawDetailsSteps(`Ocorreu um erro na hora de adicionar o usuário na whitelist do arquivo, detalhes:`);
            this.drawDetailsSteps(JSON.stringify(error));

            console.log('WHITELIST-USER-UPDATE-ERROR', error);
        });


        this.on('WHITELIST-GROUP-REMOVE-SUCCESS', (socketId, cid, itemsId, groupsName) => {
            socketId = decompressFromEncodedURIComponent(socketId);
            cid = decompressFromEncodedURIComponent(cid);
            itemsId = JSON.parse(decompressFromEncodedURIComponent(itemsId));
            groupsName = JSON.parse(decompressFromEncodedURIComponent(groupsName));

            const item = this.getCacheItem(cid),
                { index } = item;

            this.completeStep('whitelist-group-remove');
            this.drawButtonsStep();

            const key = `whitelist-items-${index}`;

            if (this.socketId() === socketId) {
                let cache = this.cache_list_getter(key) || [],
                    parseCache = cache.map(item => JSON.parse(decompressFromEncodedURIComponent(item)));

                for (const [i, item] of parseCache.entries()) {
                    if (itemsId.indexOf(item.id) !== -1) {
                        $(`#${item.id}`).fadeOut("fast", function () {
                            $(this).remove();
                        });

                        $(`#insert-whitelist-${index}-group-${item.groupName}`)
                            .attr('disabled', false)
                            .html(`<option value="${item.groupName}" id="insert-whitelist-${index}-group-${item.groupName}">${item.groupName}</option>`);

                        this.cache_list_remove(key, cache[i]);
                    };
                };

                if (!this.cache_list_getter(key) || this.cache_list_getter(key).length <= 0)
                    return $(`#btn-whitelist-remove-${index}`).attr('disabled', true);
            } else {
                for (const groupName of groupsName) {
                    const
                        select = $(`#select-whitelist-${index}-${groupName}`);

                    if (select.is(':checked'))
                        select.trigger('click');

                    $(`#item-whitelist-${index}-${groupName}`)
                        .fadeOut('fast', function () {
                            $(this).remove();
                        });
                };
            };
        });

        this.on('WHITELIST-GROUP-REMOVE-ERROR', (error) => {
            error = JSON.parse(decompressFromEncodedURIComponent(error));

            this.warningStep('whitelist-group-remove');
            this.drawButtonsStep();

            this.drawDetailsSteps(`Ocorreu um erro na hora de remover o grupo da whitelist do arquivo, detalhes:`);
            this.drawDetailsSteps(JSON.stringify(error));

            console.log('WHITELIST-GROUP-REMOVE-ERROR', error);
        });

        this.on('WHITELIST-USER-REMOVE-SUCCESS', (socketId, cid, itemsId, usersEmail) => {
            socketId = decompressFromEncodedURIComponent(socketId);
            cid = decompressFromEncodedURIComponent(cid);
            itemsId = JSON.parse(decompressFromEncodedURIComponent(itemsId));
            usersEmail = JSON.parse(decompressFromEncodedURIComponent(usersEmail));

            const item = this.getCacheItem(cid),
                { index } = item;

            this.completeStep('whitelist-user-remove');
            this.drawButtonsStep();

            const key = `whitelist-items-${index}`;

            if (this.socketId() === socketId) {
                let cache = this.cache_list_getter(key) || [],
                    parseCache = cache.map(item => JSON.parse(decompressFromEncodedURIComponent(item)));

                for (const [i, item] of parseCache.entries()) {
                    if (itemsId.indexOf(item.id) !== -1) {
                        $(`#${item.id}`).fadeOut("fast", function () {
                            $(this).remove();
                        });

                        this.cache_list_remove(key, cache[i]);
                    };
                };

                if (!this.cache_list_getter(key) || this.cache_list_getter(key).length <= 0)
                    return $(`#btn-whitelist-remove-${index}`).attr('disabled', true);
            } else {
                for (const userEmail of usersEmail) {
                    let citerator = String(userEmail).replace(/[\@,\.]/g, '');

                    $(`#select-whitelist-${index}-${citerator}`)
                        .trigger('click');

                    $(`#item-whitelist-${index}-${citerator}`)
                        .fadeOut('fast', function () {
                            $(this).remove();
                        });
                };
            };
        });

        this.on('WHITELIST-USER-REMOVE-ERROR', (error) => {
            error = JSON.parse(decompressFromEncodedURIComponent(error));

            this.warningStep('whitelist-user-remove');
            this.drawButtonsStep();

            this.drawDetailsSteps(`Ocorreu um erro na hora de remover o usuário da whitelist do arquivo, detalhes:`);
            this.drawDetailsSteps(JSON.stringify(error));

            console.log('WHITELIST-USER-REMOVE-ERROR', error);
        });
    };

    static events_trash() {
        const afterMoveToTrash = () => {
            let length = Controller.cache_list_getter('trash-items-length');

            length -= 1;

            if (length <= 0) {
                this.remove_items = {};

                $('#button-actions-remove')
                    .attr('disabled', true);

                $("#btn-confirm-remove-items")
                    .attr('disabled', false)
                    .html(`Confirmar`);

                this.completeStep('move-to-trash');
                this.drawButtonsStep();
            };

            Controller.cache_list_replaceAll('trash-items-length', length);
        };

        this.on('MOVE-TO-TRASH-SUCCESS', (socketId, key, cid, type) => {
            socketId = decompressFromEncodedURIComponent(socketId);
            key = decompressFromEncodedURIComponent(key);
            cid = decompressFromEncodedURIComponent(cid);
            type = decompressFromEncodedURIComponent(type);

            const item = this.getCacheItem(cid),
                { index } = item;

            $(`#container-item-${index}`)
                .fadeOut('fast', function () { $(this).remove(); });

            $(`#offcanvas-information-${index}`)
                .remove();

            $(`#list-item-${index}`)
                .fadeOut('fast', function () { $(this).remove(); });

            if (this.socketId() === socketId) {
                this.global('ITEM-UPDATE-AND-APPEND', compressToEncodedURIComponent(cid), compressToEncodedURIComponent(type));

                this.completeStep(`move-to-trash-${key.replace('#', '')}`);

                this.cache_list_remove(key);

                afterMoveToTrash();
            };
        });

        this.on('MOVE-TO-TRASH-ERROR', (error, cid, key) => {
            error = JSON.parse(decompressFromEncodedURIComponent(error));
            cid = decompressFromEncodedURIComponent(cid);
            key = decompressFromEncodedURIComponent(key);

            const item = this.getCacheItem(cid),
                { index } = item;

            this.warningStep(`move-to-trash-${key.replace('#', '')}`);

            this.drawDetailsSteps(`Ocorreu um erro no envio do arquivo para a lixeira, detalhes:`);
            this.drawDetailsSteps(JSON.stringify(error));

            console.log('MOVE-TO-TRASH-ERROR', error);

            $(`#item-delete-${index}`)
                .trigger('click');

            $(`#list-item-${index}`)
                .fadeOut('fast', function () { $(this).remove(); });

            this.cache_list_remove(key);

            afterMoveToTrash();
        });

        this.on('TRASH-RECOVERY-SUCCESS', (socketId, cid, type) => {
            socketId = decompressFromEncodedURIComponent(socketId);
            cid = decompressFromEncodedURIComponent(cid);
            type = decompressFromEncodedURIComponent(type);

            const item = this.getCacheItem(cid),
                { index } = item;

            this.completeStep(`trash-recovery-${index}`);
            this.drawButtonsStep();

            $(`#container-item-${index}`).fadeOut('fast', function () { $(this).remove(); });
            $(`#offcanvas-information-${index}`).remove();

            if (this.socketId() === socketId) {
                this.global('ITEM-UPDATE-AND-APPEND', compressToEncodedURIComponent(cid), compressToEncodedURIComponent(type));
            };
        });

        this.on('TRASH-RECOVERY-ERROR', (error, cid) => {
            error = JSON.parse(decompressFromEncodedURIComponent(error));
            cid = decompressFromEncodedURIComponent(cid);

            const item = this.getCacheItem(cid),
                { index } = item;

            this.warningStep(`trash-recovery-${index}`);
            this.drawButtonsStep();

            this.drawDetailsSteps(`Ocorreu um erro na hora de recuperar o arquivo da lixeira, detalhes:`);
            this.drawDetailsSteps(JSON.stringify(error));

            console.log('TRASH-RECOVERY-ERROR', error);
        });
    };

    static events_file() {
        this.on('FILE-VERSION-REMOVE-ERROR', (error, cid) => {
            error = JSON.parse(decompressFromEncodedURIComponent(error));
            cid = decompressFromEncodedURIComponent(cid);

            this.warningStep(`file-remove-versions-${cid}`);
            this.drawButtonsStep();

            this.drawDetailsSteps(`Ocorreu um erro na hora de remover uma ou mais versões do arquivo, detalhes:`);
            this.drawDetailsSteps(JSON.stringify(error));

            console.log('FILE-VERSION-REMOVE-ERROR', error);
        });

        this.on('MOVE-FILE-FOR-FOLDER-SUCCESS', (socketId, file, folder, moveToPublic) => {
            socketId = decompressFromEncodedURIComponent(socketId);
            file = JSON.parse(decompressFromEncodedURIComponent(file));
            folder = JSON.parse(decompressFromEncodedURIComponent(folder));
            moveToPublic = JSON.parse(decompressFromEncodedURIComponent(moveToPublic));

            const
                item = this.getCacheItem(file.cid);

            if (this.socketId() === socketId) {
                this.completeStep(`item-move-for-folder-${item.cid}`);
                this.drawButtonsStep();
            };

            if (item) {
                $(`#container-item-${item.index}`).fadeOut("fast", function () {
                    $(this).remove();
                    $(`
                    #${item.offcanvas.info},
                    #${item.offcanvas.downloadVersion},
                    #${item.offcanvas.moveItemFor}
                    `).remove();
                });

                this.files = this.files.filter(file => file.cid !== item.cid);
            };

            this.updateCacheItem(file.cid, file);
            this.updateCacheItem(folder.cid, folder);

            if (
                moveToPublic && this.folderId === 'public' ||
                !moveToPublic && this.folderId !== 'public'
            ) {
                this.files.push(file);
                this.append(file, 'file', false);
            };

            this.reloadListMoveItemsFor();
        });

        this.on('MOVE-FILE-FOR-FOLDER-ERROR', (error, cid) => {
            error = JSON.parse(decompressFromEncodedURIComponent(error));
            cid = decompressFromEncodedURIComponent(cid);

            this.warningStep(`item-move-for-folder-${cid}`);
            this.drawButtonsStep();

            this.drawDetailsSteps(`Ocorreu um erro na hora de mover o arquivo para a pasta, detalhes:`);
            this.drawDetailsSteps(JSON.stringify(error));

            console.log('MOVE-FILE-FOR-FOLDER-ERROR', error);
        });
    };

    static events_folder() {
        this.on('MOVE-FOLDER-FOR-FOLDER-SUCCESS', (socketId, folderSecondary, folderPrimary, moveToPublic) => {
            socketId = decompressFromEncodedURIComponent(socketId);
            folderSecondary = JSON.parse(decompressFromEncodedURIComponent(folderSecondary));
            folderPrimary = JSON.parse(decompressFromEncodedURIComponent(folderPrimary));
            moveToPublic = JSON.parse(decompressFromEncodedURIComponent(moveToPublic));

            const
                item = this.getCacheItem(folderSecondary.cid);

            if (this.socketId() === socketId) {
                this.completeStep(`item-move-for-folder-${item.cid}`);
                this.drawButtonsStep();
            };

            if (item) {
                $(`#container-item-${item.index}`).fadeOut("fast", function () {
                    $(this).remove();
                    $(`
                    #${item.offcanvas.info},
                    #${item.offcanvas.downloadVersion},
                    #${item.offcanvas.moveItemFor}
                    `).remove();
                });

                this.folders = this.folders.filter(folder => folder.cid !== item.cid);
            };

            this.updateCacheItem(folderSecondary.cid, folderSecondary);
            this.updateCacheItem(folderPrimary.cid, folderPrimary);

            if (
                moveToPublic && this.folderId === 'public' ||
                !moveToPublic && this.folderId !== 'public'
            ) {
                this.folders.push(folderSecondary);
                this.append(folderSecondary, 'folder', false);
            };

            this.reloadListMoveItemsFor();
        });

        this.on('MOVE-FOLDER-FOR-FOLDER-ERROR', (error, cid) => {
            error = JSON.parse(decompressFromEncodedURIComponent(error));
            cid = decompressFromEncodedURIComponent(cid);

            this.warningStep(`item-move-for-folder-${cid}`);
            this.drawButtonsStep();

            this.drawDetailsSteps(`Ocorreu um erro na hora de mover a pasta para outra pasta, detalhes:`);
            this.drawDetailsSteps(JSON.stringify(error));

            console.log('MOVE-FOLDER-FOR-FOLDER-ERROR', error);
        });
    };

    /**
     * @description Update
     */
    static update() {
        this.updateItem();
    };

    static updateItem() {
        this.on('ITEM-UPDATE', async (cid, item) => {
            cid = decompressFromEncodedURIComponent(cid);
            item = JSON.parse(decompressFromEncodedURIComponent(item));

            return this.updateCacheItem(cid, item);
        });

        this.on('ITEM-CHANGE-WITH-PRIVILEGE', async (cid, item, type) => {
            cid = decompressFromEncodedURIComponent(cid);
            item = JSON.parse(decompressFromEncodedURIComponent(item));
            type = decompressFromEncodedURIComponent(type);

            const { index } = this.getCacheItem(cid);

            this.changeWithPrivilege(index, item, type);
        });
    };
};