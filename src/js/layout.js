// ======================================================================
// Imports
//
import indexedDB_users from './IndexedDB/indexedDB_users';
import indexedDB_cache from './IndexedDB/indexedDB_cache';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

(async function () {
    "use strict";

    // ======================================================================
    // Default Variables
    //
    const
        DEFAULT_DELAY = 3600,
        ONE_SECOND_DELAY = 1000,
        usersDB = new indexedDB_users(),
        cacheDB = new indexedDB_cache();

    let MAIN_MENU = {},
        WINDOW_SELECTED = false;

    // ======================================================================
    // Default Functions
    //
    function lockClosePage() {
        return window.onbeforeunload = function (e) {
            // Cancelar o evento
            e.preventDefault(); // Se você impedir o comportamento padrão no Mozilla Firefox, o prompt será sempre mostrado
            // O Chrome requer que returnValue seja definido
            e.returnValue = '';
        };
    }

    const loading = function (state) {
        if (state) {
            window.loading_screen = window.pleaseWait({
                logo: '',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                loadingHtml: ` \
                <div class="d-flex flex-column"> \
                    <div class="sk-cube-grid align-self-center"> \
                        <div class="sk-cube sk-cube1"></div> \
                        <div class="sk-cube sk-cube2"></div> \
                        <div class="sk-cube sk-cube3"></div> \
                        <div class="sk-cube sk-cube4"></div> \
                        <div class="sk-cube sk-cube5"></div> \
                        <div class="sk-cube sk-cube6"></div> \
                        <div class="sk-cube sk-cube7"></div> \
                        <div class="sk-cube sk-cube8"></div> \
                        <div class="sk-cube sk-cube9"></div> \
                    </div> \
                </div> \
                `
            });
        } else {
            if (window.loading_screen)
                window.loading_screen.finish();
        }
    }

    loading(true);

    // ======================================================================
    // Cache
    //
    class Cache {
        constructor(id = '0001') {
            this._id = id;
            this._clearTimeout = null;
            this.initialize();
        };

        async initialize() {
            await this.load();

            this.update();
        };

        id() {
            return this._id;
        };

        cache() {
            return this._cache;
        };

        async save() {
            return await cacheDB.set(this.id(), this.cache());
        };

        async load() {
            const data = await cacheDB.get(this.id());

            if (data instanceof Array === false) {
                this._cache = [];
            } else {
                this._cache = data;
            };
        };

        find(key) {
            let __find = false;

            for (const [index, cache] of this.cache().entries()) {
                if (cache.key === key) {
                    __find = index;
                    break;
                };
            };

            return __find;
        };

        async clear() {
            const __cache = this.cache().slice(0);

            for (const [index, cache] of __cache.entries()) {
                const
                    now = new Date(),
                    expiry = new Date(cache.expiry);

                if (now > expiry) {
                    this._cache.splice(index, 1);
                };
            };

            return await this.save();
        };

        parserExpiry(expiry) {
            let
                value = parseInt(expiry.replace(/[^0-9]/g, '').trim() || "0"),
                type = expiry.replace(String(value), '').toLowerCase().trim(),
                now = new Date();

            if (
                type === 'days'
                || type === 'day'
                || type === 'd'
            ) {
                now.setDate(now.getDate() + value);
            };

            if (
                type === 'weeks'
                || type === 'week'
                || type === 'w'
            ) {
                now.setDate(now.getDate() + (7 * value));
            };

            if (
                type === 'hours'
                || type === 'hour'
                || type === 'h'
            ) {
                now.setHours(now.getHours() + value);
            };

            if (
                type === 'minutes'
                || type === 'minute'
                || type === 'm'
            ) {
                now.setMinutes(now.getMinutes() + value);
            };

            if (
                type === 'seconds'
                || type === 'second'
                || type === 's'
            ) {
                now.setSeconds(now.getSeconds() + value);
            };

            return now;
        };

        set(key, value, expiry) {
            if (typeof this.find(key) !== 'number') {
                this._cache.push({ key, value, expiry: this.parserExpiry(expiry) });
            };
        };

        get(key) {
            let index = this.find(key);

            return this.cache()[index] || false;
        };

        async update() {
            await this.clear();

            if (this._clearTimeout)
                clearTimeout(this._clearTimeout);

            this._clearTimeout = setTimeout(this.update.bind(this), ONE_SECOND_DELAY);
        };
    }

    /**
     * @description LocalStorage
     */
    function localStorage_save(key, value) {
        return localStorage.setItem(key, value);
    };

    function localStorage_get(key) {
        return localStorage.getItem(key);
    };

    function localStorage_clear(key) {
        return localStorage.removeItem(key);
    };

    function localStorage_empty() {
        return localStorage.clear();
    };

    // ======================================================================
    // Alerts
    //
    let alerts = {
        cache: [],
        show: null,
        interval: null,
        clear: null
    };

    function alerting(message = '???', delay = DEFAULT_DELAY, callback = function () { }, saveCache = true) {
        if (alerts.clear) return;

        let msgAlreadyExist = false;

        for (const cache of alerts.cache) {
            if (cache.message === message) {
                msgAlreadyExist = true;
                break;
            }
        };

        if (saveCache && !msgAlreadyExist)
            alerts.cache.push({ message, delay, callback });

        if (alerts.show) return;

        if (!alerts.interval)
            alerts.interval = setInterval(() => {
                if (alerts.show) return;

                if (alerts.cache.length > 0) {
                    alerts.cache.splice(0, 1);

                    if (alerts.cache[0])
                        return alerting(alerts.cache[0]['message'], alerts.cache[0]['delay'], alerts.cache[0]['callback'], false);
                }
                else
                    return clearInterval(alerts.interval), alerts.interval = null;
            }, ONE_SECOND_DELAY);

        $('body').append(`\
        <div style="z-index: 9999; font-size: 18px;" class="alertDiv alert alert-mave alert-dismissible fade show shadow fixed-top m-2 text-truncate" role="alert">\
            <strong>${message}</strong>\
        </div>\
        `), alerts.show = true;

        setTimeout(function () {
            $('.alertDiv').fadeOut("slow", function () {
                return $('.alertDiv').remove(), callback(), alerts.show = null;
            });
        }, delay);
    }

    function clearAlerting(callback = function () { }) {
        if (!alerts.clear) alerts.clear = true;

        $('.alertDiv').fadeOut("slow", function () {
            if (alerts.interval) clearInterval(alerts.interval), alerts.interval = null;

            alerts = { cache: [], show: null, interval: null, clear: null };

            $('.alertDiv').remove(), callback();
        });
    }

    // ======================================================================
    // Modal to Select
    //
    function openModalSelect(title = 'Grupo Mave Digital', contentHTML = [
        '<p>Essa é uma caixa de escolha.</p>',
        '<p>Essa é uma caixa de escolha.</p>'
    ], buttons = [
        '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Rejeitar</button>',
        '<button type="button" class="btn btn-primary">Aceitar</button>'
    ], dismiss = false) {
        if (!WINDOW_SELECTED)
            return new Promise((resolve, reject) => {
                try {
                    const addContent = function (str = '') {
                        contentHTML.forEach(element => {
                            str += element;
                        });

                        return str;
                    },
                        addButtons = function (str = '') {
                            buttons.forEach(element => {
                                str += element;
                            });

                            return str;
                        }

                    if (document.getElementById('modalSelect')) $('#modalSelect').remove();

                    $('body').append(`\
                    <div id="modalSelect" class="modal fade" tabindex="-1"> \
                        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"> \
                            <div class="modal-content shadow"> \
                                <div class="modal-header bg-primary shadow"> \
                                    <h5 class="modal-title text-secondary fw-bold">${title}</h5> \
                                    ${dismiss ? '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>' : ''} \
                                </div> \
                                <div class="modal-body"> \
                                    ${addContent()} \
                                </div> \
                                <div class="modal-footer"> \
                                    ${addButtons()} \
                                </div> \
                            </div> \
                        </div> \
                    </div> \
                    `);

                    var modalSelect = new bootstrap.Modal(document.getElementById('modalSelect'), {
                        backdrop: 'static',
                        keyboard: false,
                        focus: true
                    });

                    document.getElementById('modalSelect')
                        .addEventListener('shown.bs.modal', function (event) {
                            WINDOW_SELECTED = true;
                        });

                    document.getElementById('modalSelect')
                        .addEventListener('hidden.bs.modal', function (event) {
                            WINDOW_SELECTED = false;
                        });

                    modalSelect.show();

                    return resolve(modalSelect);
                } catch (error) {
                    return reject(error);
                }
            });
    }

    // ======================================================================
    // General Functions
    //

    function externalMailOpen(email) {
        return window.open(`mailto:${email}`, '_blank');
    };

    const animateCSS = (element, animation, prefix = 'animate__') =>
        new Promise((resolve, reject) => {
            const animationName = `${prefix}${animation}`;
            const node = document.querySelector(element);

            node.classList.add(`${prefix}animated`, animationName);

            function handleAnimationEnd(event) {
                event.stopPropagation();
                node.classList.remove(`${prefix}animated`, animationName);
                resolve('Animation ended');
            }

            node.addEventListener('animationend', handleAnimationEnd, { once: true });
        });

    // ======================================================================
    // Authentication - TwoFactor
    //

    function twofactor(callback = () => { }, usr_auth) {
        $('body').append(`\
        <div style="z-index: 9999; height: 100vh; opacity: 0;" class="twofactorDiv fixed-top col-12 overflow-auto"> \
          <h1 class="text-white text-center fs-1 fw-bold m-5">Autenticação de dois fatores está ativada. Por gentileza, insira seu código de segurança.</h1><br />\
          <div class="col-10 mx-auto mb-5"> \
            <label for="twofactor-usertoken">Insira o código que aparece em seu visor</label> \
            <input type="tel" class="form-control mb-2" id="twofactor-usertoken"> \
            <button type="button" class="btn btn-mave1 col-12 mb-2" id="twofactor-button">Validar</button> \
            <button type="button" class="btn btn-danger col-12" id="twofactor-button-2">Recuperar a conta</button> \
            <h6 class="text-white text-center fw-bold m-3" style="opacity: 0;" id="twofactor-text">Você irá receber um email com as instruções para recuperar sua conta.</h6><br />\
        </div>\
        `);

        document.getElementById('twofactor-button').onclick = () => { callback($('#twofactor-usertoken').val()) };
        document.getElementById('twofactor-button-2').onclick = () => {
            if ($("#twofactor-text").css('opacity') == 0)
                retrievetwofactor(() => {
                    $("#twofactor-text")
                        .animate({
                            'opacity': 1
                        }, ONE_SECOND_DELAY)
                        .delay(3000)
                        .animate({
                            'opacity': 0
                        }, ONE_SECOND_DELAY);
                }, usr_auth);
        };

        $(".twofactorDiv").animate({
            'opacity': 1
        }, ONE_SECOND_DELAY);
    };

    async function retrievetwofactor(callback = () => { }, usr_auth) {
        window.app.loading(true);

        const { internetadress } = await window.app.storage_get_userInfo();

        fetch(window.app.graphqlUrl, {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
                "authorization": "nlyachaglswisifrufrod0stEpec@UwlvizestAtr1xajanegaswa@remopheWip",
                "internetadress": compressToEncodedURIComponent(internetadress),
                "encodeuri": false
            },
            "body": `{\"query\":\"mutation { authRetrieveTwofactor(usr_auth: \\\"${usr_auth}\\\") }\"}`
        })
            .then(response => response.json())
            .then(({ data, errors }) => {
                window.app.loading(false);

                if (errors)
                    return errors.forEach(error => window.app.alerting(error.message));

                if (data['authRetrieveTwofactor']) {
                    callback();
                    return window.app.alerting(`Email de recuperação da conta enviado!`);
                } else {
                    return window.app.alerting(`Email de recuperação da conta não pode ser enviado!`);
                }
            })
            .catch(err => {
                window.app.alerting('Ocorreu um erro com o servidor. Tente novamente mais tarde!');

                throw new Error(err);
            });
    };

    // ======================================================================
    // Default Events
    //
    $(() => {
        loading(false);

        setTimeout(async () => {
            const { token } = await window.app.storage_get_userInfo();
            if (token) {
                console.log(token);
            }
        }, 180000);

        $(window).on('scroll', function () {
            if ($(window).scrollTop() > 0) {
                $('#buttonToTop').addClass('show');
            } else {
                $('#buttonToTop').removeClass('show');
            }
        });

        $('#buttonToTop').on('click', function (e) {
            e.preventDefault();
            $('html, body').animate({
                scrollTop: 0
            }, 400);
        });

        $('#buttonMenu').on('click', function (e) {
            if (MAIN_MENU['width'] === undefined)
                MAIN_MENU['width'] = Math.floor($('#app-menu').width());
            if (MAIN_MENU['class'] === undefined)
                MAIN_MENU['class'] = 'col-md-9 col-lg-10';
            if (MAIN_MENU['freeze'] === undefined)
                MAIN_MENU['freeze'] = false;

            animateCSS('#buttonMenu', 'jello');

            if (!MAIN_MENU['freeze'] && $('#app-menu').position().left == 0) {
                MAIN_MENU['freeze'] = true;
                $('#buttonMenu').text('menu');
                $('#app-menu').animate({
                    opacity: 0,
                    left: `-=${MAIN_MENU['width']}`
                }, window.app.ONE_SECOND_DELAY / 2, function () {
                    $('#app-menu').hide();
                    $('#app-content').removeClass(MAIN_MENU['class']);
                    MAIN_MENU['freeze'] = false;
                });
            } else if (!MAIN_MENU['freeze'] && $('#app-menu').position().left < 0) {
                MAIN_MENU['freeze'] = true;
                $('#buttonMenu').text('menu_open');
                $('#app-menu').show();
                $('#app-menu').animate({
                    opacity: 1,
                    left: `+=${MAIN_MENU['width']}`
                }, window.app.ONE_SECOND_DELAY / 2, function () {
                    $('#app-content').addClass(MAIN_MENU['class']);
                    MAIN_MENU['freeze'] = false;
                });
            }
        });

        defaultSetters();
        getLocationIP();
    });

    async function defaultSetters() {
        if (document.getElementById('usr-username')) {
            const { username } = await window.app.storage_get_userInfo();
            document.getElementById('usr-username').innerText = username;
        }
    }

    var baseurl = String(location.origin);

    function getLocationIP() {
        fetch(`${baseurl}/ipinfo`, {
            "method": "GET",
            "headers": {
                "Content-Type": "application/json"
            },
            "params": `{}`
        })
            .then(response => response.json())
            .then(async data => {
                const oldInfo = await window.app.storage_get_userInfo();

                window.app.storage_set_userInfo({
                    ...oldInfo,
                    locationIP: `${data['country']}(${data['city']}/${data['region']})`,
                    internetadress: `${data['ip']}`
                })
            })
            .catch(err => {
                window.app.alerting('Ocorreu um erro com o servidor. Tente novamente mais tarde!');

                throw new Error(err);
            });
    }

    function home() {
        return document.location = `${window.app.baseurl}`;
    }

    async function logout() {
        window.app.loading(true);

        const { auth, token, internetadress } = await window.app.storage_get_userInfo();

        if (!auth && !token)
            return document.location = `${baseurl}/user/auth`;

        fetch(window.app.graphqlUrl, {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
                "authorization": "vlta#eke08uf=48uCuFustLr3ChL9a1*wrE_ayi0L*oFl-UHidlST8moj9f8C5L4",
                "token": compressToEncodedURIComponent(token),
                "internetadress": compressToEncodedURIComponent(internetadress),
                "encodeuri": true
            },
            "body": `{\"query\":\"query { authLogout(usr_auth: \\\"${compressToEncodedURIComponent(auth)}\\\", usr_token: \\\"${compressToEncodedURIComponent(token)}\\\") }\"}`
        })
            .then(response => response.json())
            .then(async ({ data, errors }) => {
                window.app.loading(false);

                if (errors)
                    return errors.forEach(error => window.app.alerting(error.message));

                if (data['authLogout']) {
                    await window.app.storage_clear_userInfo();

                    window.app.localStorage().empty();

                    return document.location = `${baseurl}`;
                }
                else
                    return window.app.alerting('Não foi possível desconectar. Tente novamente mais tarde!');
            })
            .catch(err => {
                window.app.alerting('Ocorreu um erro com o servidor. Tente novamente mais tarde!');

                throw new Error(err);
            });
    }

    async function expired() {
        window.app.loading(true);

        const { auth, token, internetadress } = await window.app.storage_get_userInfo();

        if (!auth && !token)
            return document.location = `${baseurl}/user/auth`;

        fetch(window.app.graphqlUrl, {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
                "authorization": "5wEvlBR8TRuxePL42thecuv8sP3Pe4lB56EzLBra9Iph9WiPRId3ONL20uK7T#Ip",
                "token": compressToEncodedURIComponent(token),
                "internetadress": compressToEncodedURIComponent(internetadress),
                "encodeuri": true
            },
            "body": `{\"query\":\"query { authExpired(usr_auth: \\\"${compressToEncodedURIComponent(auth)}\\\", usr_token: \\\"${compressToEncodedURIComponent(token)}\\\") }\"}`
        })
            .then(response => response.json())
            .then(async ({ data, errors }) => {
                window.app.loading(false);

                if (errors)
                    return errors.forEach(error => window.app.alerting(error.message));

                if (data['authExpired']) {
                    await window.app.storage_clear_userInfo();

                    window.app.localStorage().empty();

                    return document.location = `${baseurl}/user/auth`;
                }
                else
                    return window.app.alerting('Não foi possível desconectar. Tente Novamente mais tarde!');
            })
            .catch(err => {
                window.app.alerting('Ocorreu um erro com o servidor. Tente novamente mais tarde!');

                throw new Error(err);
            });
    }

    function getUserEmail(auth) {
        return new Promise(async (resolve, reject) => {
            const { token, internetadress } = await window.app.storage_get_userInfo();

            if (!token)
                return document.location = `${baseurl}/user/auth`;

            fetch(window.app.graphqlUrl, {
                "method": "POST",
                "headers": {
                    "Content-Type": "application/json",
                    "authorization": "NoZjIRxH*miT4xs!$sR&oOdBxk6*1x!lcXDDwf#d!XuJ#hyHAVpIFrnAI@T9pIFr",
                    "token": compressToEncodedURIComponent(token),
                    "internetadress": compressToEncodedURIComponent(internetadress),
                    "encodeuri": true
                },
                "body": JSON.stringify({
                    query: `query { getUserInfo( \
                        usr_auth: \"${compressToEncodedURIComponent(auth)}\" \
                    ) { email } }`
                })
            })
                .then(response => response.json())
                .then(async ({ data, errors }) => {
                    if (errors) {
                        return reject(errors);
                    }

                    return resolve(data['getUserInfo']['email']);
                })
                .catch(error => {
                    return reject(error);
                });
        });
    }

    function getFolderInfo(cid) {
        return new Promise(async (resolve, reject) => {
            const { token, internetadress } = await window.app.storage_get_userInfo();

            if (!token)
                return document.location = `${baseurl}/user/auth`;

            fetch(window.app.graphqlUrl, {
                "method": "POST",
                "headers": {
                    "Content-Type": "application/json",
                    "authorization": "guI{rrKJGtc8{/4po.fd<rt48s]Lg_CXd$-?.3}g;_N<T(]Grw97.jczDR?>gy&]",
                    "token": compressToEncodedURIComponent(token),
                    "internetadress": compressToEncodedURIComponent(internetadress),
                    "encodeuri": false
                },
                "body": JSON.stringify({
                    query: `query { folderGet( \
                        filter: { cid: \"${cid}\" }, \
                        skip: ${0}, \
                        limit: ${0} \
                    ) { \
                        cid authorId name description status type tag filesId foldersId \
                    } }`
                })
            })
                .then(response => response.json())
                .then(async ({ data, errors }) => {
                    if (errors) {
                        return reject(errors);
                    }

                    return resolve(data['folderGet']);
                })
                .catch(error => {
                    return reject(error);
                });
        });
    }

    function modalOpen(id) {
        $(`#${id}`).modal('show', {
            backdrop: 'static',
            keyboard: false
        });
    }

    function formatMoney(amount, decimalCount = 2, decimal = ".", thousands = ",") {
        try {
            decimalCount = Math.abs(decimalCount);
            decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

            const negativeSign = amount < 0 ? "-" : "";

            let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
            let j = (i.length > 3) ? i.length % 3 : 0;

            return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");
        } catch (e) {
            console.log(e)
        }
    }

    function stringPadZero(str, length) {
        var s = String(str);
        while (s.length < length) {
            s = '0' + s;
        }
        return s;
    };

    function fileContainValidExtensionAndSize(filename, filesize, extensions, maxSize) {
        const extension = filename.slice(filename.lastIndexOf('.'));

        if (extensions.indexOf(extension) === -1)
            return window.app.alerting(`A extensão ${extension} do arquivo não poder ser usada.`);

        if (maxSize < filesize)
            return window.app.alerting(`O tamanho de ${byteSize(filesize)} do arquivo é maior que o máximo permitido de 20 MB.`);

        return true;
    };

    function valueClearCustomsCharacters(text, characters) {
        try {
            const search = new RegExp(characters);

            if (typeof text === 'string')
                return text.replace(search, '');

            return "";
        } catch (error) {
            if (typeof text === 'string')
                return text.replace(characters, '');

            return "";
        }
    };

    /**
     * @class Input
     * @description Classe utilizada para interagir com inputs
     */

    class Input {
        constructor(options = {}) {
            this.minSuccess = Number(options['minSuccess']) || undefined;
        };

        handle(inputID, callback) {
            if (inputID instanceof Array) {
                const length = inputID.filter(id => callback(id)).length;

                if (!this.minSuccess)
                    return length >= inputID.length;
                else
                    return length >= this.minSuccess;
            } else {
                return callback(inputID);
            };
        };

        isValid(inputID) {
            return this.handle(inputID, (id) => {
                const input = $(`#${id}`) || id;

                if (!input.hasClass('is-valid'))
                    input
                        .removeClass('is-invalid')
                        .addClass('is-valid');
            });
        };

        isInvalid(inputID) {
            return this.handle(inputID, (id) => {
                const input = $(`#${id}`) || id;

                if (!input.hasClass('is-invalid'))
                    input
                        .removeClass('is-valid')
                        .addClass('is-invalid');
            });
        };

        clearValidOrInvalid(inputID) {
            return this.handle(inputID, (id) => {
                const input = $(`#${id}`) || id;

                if (input.hasClass('is-valid') || input.hasClass('is-invalid'))
                    input.removeClass('is-valid is-invalid')
            });
        };

        isMail(inputID) {
            return this.handle(inputID, (id) => {
                const
                    input = $(`#${id}`) || id,
                    search = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/g;

                if (input.val().match(search))
                    return input.val().match(search).filter(val => val !== '').length > 0;
                else
                    return false;
            });
        };

        enable(inputID) {
            return this.handle(inputID, (id) => {
                const input = $(`#${id}`) || id;

                input.attr('disabled', false);
            });
        };

        disable(inputID) {
            return this.handle(inputID, (id) => {
                const input = $(`#${id}`) || id;

                input.attr('disabled', true);
            });
        };

        setValue(inputID, value) {
            return this.handle(inputID, (id) => {
                if ($(`#${id}`)) {
                    $(`#${id}`).val(value);
                } else {
                    $(input).val(value);
                };
            });
        };

        valueIsLarger(inputID, value) {
            return this.handle(inputID, (id) => {
                if ($(`#${id}`)) {
                    const input = $(`#${id}`).val();

                    return input.length >= value;
                } else {
                    const input = id;

                    return input.length >= value;
                };
            });
        };

        valueIsLess(inputID, value) {
            return this.handle(inputID, (id) => {
                if ($(`#${id}`)) {
                    const input = $(`#${id}`).val();

                    return input.length <= value;
                } else {
                    const input = id;

                    return input.length <= value;
                };
            });
        };

        valueIsMinAndMax(inputID, min, max) {
            return this.handle(inputID, (id) => {
                if ($(`#${id}`)) {
                    const input = $(`#${id}`).val();

                    return input.length >= min && input.length <= max;
                } else {
                    const input = id;

                    return input.length >= min && input.length <= max;
                };
            });
        };

        valueContainsCustomsCharacters(inputID, characters) {
            return this.handle(inputID, (id) => {
                if ($(`#${id}`)) {
                    const
                        input = $(`#${id}`).val();

                    if (input.search(characters) !== -1) {
                        return true;
                    };

                    return false;
                } else {
                    const
                        value = id;

                    if (value.search(characters) !== -1) {
                        return true;
                    };

                    return false;
                };
            });
        };

        valueClearCustomsCharacters(inputID, characters) {
            return this.handle(inputID, (id) => {
                if ($(`#${id}`)) {
                    const
                        input = $(`#${id}`).val();

                    try {
                        const search = new RegExp(characters);

                        $(`#${id}`).val(input.replace(search, ''));
                    } catch {
                        $(`#${id}`).val(input.replace(characters, ''));
                    };
                } else {
                    const input = id;

                    try {
                        const search = new RegExp(characters);

                        input.innerText = input.replace(search, '');
                    } catch {
                        input.innerText = input.replace(characters, '');
                    };
                };
            });
        };
    };

    // ======================================================================
    // Storage
    // Manager all application memory

    //  - DB >> Users
    function storage_get_userInfo() {
        if (usersDB) {
            return usersDB.getUserInfo();
        } else {
            return {
                username: localStorage.getItem('usr-username'),
                name: localStorage.getItem('usr-name'),
                auth: localStorage.getItem('usr-auth'),
                privileges: localStorage.getItem('usr-privileges'),
                email: localStorage.getItem('usr-email'),
                token: localStorage.getItem('usr-token'),
                locationIP: localStorage.getItem('usr-locationIP'),
                internetadress: localStorage.getItem('usr-internetadress')
            }
        }
    }

    function storage_set_userInfo(info) {
        if (usersDB) {
            return usersDB.setUserInfo(info);
        } else {
            Object
                .keys(info)
                .forEach(key => localStorage.setItem(`usr-${key}`, info[key]));
        };
    };

    function storage_clear_userInfo() {
        if (usersDB)
            return usersDB.clearUserInfo();

        return window.app.localStorage().empty();
    };

    // ======================================================================
    // File - Upload
    //
    function fileUpload(files = [], custompath) {
        return new Promise(async (resolve, reject) => {
            if (files.length <= 0) return;

            const form = new FormData(),
                { token, internetadress } = await window.app.storage_get_userInfo();

            let i = 0, l = files.length;

            for (i; i < l; i++) {
                form.append(`attachment_${i}`, files.item(i));
            }

            const settings = {
                "async": true,
                "crossDomain": true,
                "url": `${window.app.baseurl}/system/upload/file`,
                "method": "POST",
                "headers": {
                    'usr_token': token,
                    'usr_internetadress': internetadress,
                    'custompath': custompath
                },
                "processData": false,
                "contentType": false,
                "mimeType": "multipart/form-data",
                "data": form
            };

            $.ajax(settings)
                .done(function (response) {
                    return resolve(JSON.parse(response));
                })
                .fail(function (error) {
                    return reject(error);
                });
        })
    };

    // ======================================================================
    // Array to String
    //
    function arrayToString(array = [], type = 'media') {
        let i = 0, l = array.length, array_str = '';

        switch (String(type).toLowerCase()) {
            case 'media':
                for (; i < l; i++) {
                    array_str += `{ media: \"${array[i]['media']}\", url: \"${array[i]['url']}\"}${i + 1 >= l ? '' : ','}`
                }
                break;
            case 'socialmedia':
                for (; i < l; i++) {
                    array_str += `{ name: \"${array[i]['name']}\", value: \"${array[i]['value']}\", enabled: ${array[i]['enabled']}}${i + 1 >= l ? '' : ','}`
                }
                break;
        }

        return array_str;
    }

    // ======================================================================
    // vCard
    //
    function vcardCreate(
        firstname = 'Luiz',
        lastname = 'Guilherme dos Santos',
        organization = 'Grupo Mave',
        photo = { path: 'assets/perfil/', name: 'guilherme.jpg' },
        logo = { path: 'assets/Logos/Grupo Mave/', name: 'logo_grupo_mave_faixa-cima.png' },
        workPhone = ['11 3683-3408', '(11) 99999-9999'],
        birthday = { year: 1999, month: 1, day: 17 },
        title = 'Analista Programador',
        url = 'https://grupomave.com.br',
        workUrl = "https://grupomavedigital.com.br",
        email = 'suporte@grupomave.com.br',
        label = 'Work Address',
        countryRegion = 'Brazil',
        street = 'R. Barão de Itaúna, 397 - Lapa, São Paulo - SP, 05078-080',
        city = 'São Paulo',
        stateProvince = 'São Paulo',
        postalCode = '05078-080',
        socialUrls = [
            {
                media: "Youtube",
                url: "https://www.youtube.com/channel/UC5y4IOAlxQ4eictbudG785g"
            },
            {
                media: "Linkedin",
                url: "https://www.linkedin.com/company/grupo-mave/?originalSubdomain=pt"
            },
            {
                media: "Instagram",
                url: "https://www.instagram.com/grupo.mave/"
            },
            {
                media: "Facebook",
                url: "https://www.facebook.com/grupomaveoficial/"
            }
        ]
    ) {
        return new Promise(async (resolve, reject) => {
            const { token, internetadress } = await window.app.storage_get_userInfo();

            fetch(window.app.graphqlUrl, {
                "method": "POST",
                "headers": {
                    "Content-Type": "application/json",
                    "authorization": "fA=ireb506d@lgAdA9&OfaSawro?a_11rajo_+dud@uph_k1gasweprut-owr+br",
                    "token": compressToEncodedURIComponent(token),
                    "internetadress": compressToEncodedURIComponent(internetadress),
                    "encodeuri": false
                },
                "body": JSON.stringify({
                    query: `mutation { filename: vcardCreate(data: { \
                        firstname: \"${firstname}\" \
                        lastname: \"${lastname}\" \
                        organization: \"${organization}\" \
                        photo: { path: \"${photo['path']}\", name: \"${photo['name']}\" } \
                        logo: { path: \"${logo['path']}\", name: \"${logo['name']}\" } \
                        workPhone: [ \"${workPhone[0]}\", \"${workPhone[1]}\" ] \
                        birthday: { year: ${birthday['year']}, month: ${birthday['month']}, day: ${birthday['day']} } \
                        title: \"${title}\" \
                        url: \"${url}\" \
                        workUrl: \"${workUrl}\" \
                        email: \"${email}\" \
                        label: \"${label}\" \
                        countryRegion: \"${countryRegion}\" \
                        street: \"${street}\" \
                        city: \"${city}\" \
                        stateProvince: \"${stateProvince}\" \
                        postalCode: \"${postalCode}\" \
                        socialUrls: [ ${arrayToString(socialUrls)} ] \
                    } ) }`
                })
            })
                .then(response => response.json())
                .then(({ data, errors }) => {
                    window.app.loading(false);

                    if (errors)
                        return errors.forEach(error => window.app.alerting(error.message));

                    resolve(data);
                })
                .catch(err => reject(err));
        })
    }

    // ======================================================================
    // Cartão Digital
    //
    function cardCreate(
        id = "",
        version = '1.0',
        photo = {
            path: 'assets/perfil/',
            name: 'guilherme.jpg'
        },
        name = 'Luiz Guilherme',
        jobtitle = 'Analista Programador',
        phones = [
            '11 3683-3408',
            '11 98497-9536'
        ],
        whatsapp = {
            phone: '11 947841110',
            text: 'Olá tudo bem? como representante comercial do Grupo Mave, estou aqui para ajudar no que for possível. Qual sua dúvida?',
            message: 'Olá, este é o cartão de visita digital interativo do Grupo Mave. Tenha todas as informações a um clique. Acesse o link e saiba mais!'
        },
        vcard = {
            firstname: 'Luiz',
            lastname: 'Guilherme dos Santos',
            organization: 'Grupo Mave',
            photo: { path: 'assets/perfil/', name: 'guilherme.jpg' },
            logo: { path: 'assets/Logos/Grupo Mave/', name: 'logo_grupo_mave_faixa-cima.png' },
            workPhone: ['11 3683-3408', '(11) 99999-9999'],
            birthday: { year: 1999, month: 1, day: 17 },
            title: 'Analista Programador',
            url: 'https://grupomave.com.br',
            workUrl: "https://grupomavedigital.com.br",
            email: 'suporte@grupomave.com.br',
            label: 'Work Address',
            countryRegion: 'Brazil',
            street: 'R. Barão de Itaúna, 397 - Lapa, São Paulo - SP, 05078-080',
            city: 'São Paulo',
            stateProvince: 'São Paulo',
            postalCode: '05078-080',
            socialUrls: [
                {
                    media: "Youtube",
                    url: "https://www.youtube.com/channel/UC5y4IOAlxQ4eictbudG785g"
                },
                {
                    media: "Linkedin",
                    url: "https://www.linkedin.com/company/grupo-mave/?originalSubdomain=pt"
                },
                {
                    media: "Instagram",
                    url: "https://www.instagram.com/grupo.mave/"
                },
                {
                    media: "Facebook",
                    url: "https://www.facebook.com/grupomaveoficial/"
                }
            ],
            file: {
                path: 'vcf/',
                name: 'layout.vcf'
            }
        },
        footer = {
            email: 'ti@grupomave.com.br',
            location: 'R. Barão de Itaúna, 397 - Lapa, São Paulo - SP, 05078-080',
            website: 'https://grupomave.com.br',
            attachment: '/assets/Apresentação/APRESENTACAO_MAVE.pdf',
            socialmedia: [
                {
                    name: 'Youtube',
                    value: "https://www.youtube.com/channel/UC5y4IOAlxQ4eictbudG785g",
                    enabled: true
                },
                {
                    name: 'Linkedin',
                    value: "https://www.linkedin.com/company/grupo-mave/?originalSubdomain=pt",
                    enabled: true
                },
                {
                    name: 'Instagram',
                    value: "https://www.instagram.com/grupo.mave/",
                    enabled: true
                },
                {
                    name: 'Facebook',
                    value: "https://www.facebook.com/grupomaveoficial/",
                    enabled: true
                }
            ]
        }
    ) {
        return new Promise(async (resolve, reject) => {
            const { token, internetadress } = await window.app.storage_get_userInfo();

            fetch(window.app.graphqlUrl, {
                "method": "POST",
                "headers": {
                    "Content-Type": "application/json",
                    "authorization": "6T9YEPuTRu3e0aQevEdeVA8r1Dr&8RAFReSud0&Huhld##*&E#==E*OBr2&h$wEC",
                    "token": compressToEncodedURIComponent(token),
                    "internetadress": compressToEncodedURIComponent(internetadress),
                    "encodeuri": false
                },
                "body": JSON.stringify({
                    query: `mutation { url: cardCreate(data: { \
                        id: \"${id}\" \
                        version: \"${version}\" \
                        photo: { path: \"${photo['path']}\", name: \"${photo['name']}\" } \
                        name: \"${name}\" \
                        jobtitle: \"${jobtitle}\" \
                        phones: [ \"${phones[0]}\", \"${phones[1]}\" ] \
                        whatsapp: { phone: \"${whatsapp['phone']}\", text: \"${whatsapp['text']}\", message: \"${whatsapp['message']}\" } \
                        vcard: { \
                            firstname: \"${vcard['firstname']}\" \
                            lastname: \"${vcard['lastname']}\" \
                            organization: \"${vcard['organization']}\" \
                            photo: { path: \"${vcard['photo']['path']}\", name: \"${vcard['photo']['name']}\" } \
                            logo: { path: \"${vcard['logo']['path']}\", name: \"${vcard['logo']['name']}\" } \
                            workPhone: [ \"${vcard['workPhone'][0]}\", \"${vcard['workPhone'][1]}\" ] \
                            birthday: { year: ${vcard['birthday']['year']}, month: ${vcard['birthday']['month']}, day: ${vcard['birthday']['day']} } \
                            title: \"${vcard['title']}\" \
                            url: \"${vcard['url']}\" \
                            workUrl: \"${vcard['workUrl']}\" \
                            email: \"${vcard['email']}\" \
                            label: \"${vcard['label']}\" \
                            countryRegion: \"${vcard['countryRegion']}\" \
                            street: \"${vcard['street']}\" \
                            city: \"${vcard['city']}\" \
                            stateProvince: \"${vcard['stateProvince']}\" \
                            postalCode: \"${vcard['postalCode']}\" \
                            socialUrls: [ ${arrayToString(vcard['socialUrls'])} ] \
                            file: { path: \"${vcard['file']['path']}\", name: \"${vcard['file']['name']}\" } \
                        } \
                        footer: { \
                            email: \"${footer['email']}\" \
                            location: \"${footer['location']}\" \
                            website: \"${footer['website']}\" \
                            attachment: \"${footer['attachment']}\" \
                            socialmedia: [ ${arrayToString(footer['socialmedia'], 'socialmedia')} ] \
                        } \
                    } ) }`
                })
            })
                .then(response => response.json())
                .then(({ data, errors }) => {
                    window.app.loading(false);

                    if (errors)
                        return errors.forEach(error => window.app.alerting(error.message));

                    resolve(data);
                })
                .catch(err => reject(err));
        })
    }

    function cardUpdate(
        id = '',
        version = '1.0',
        photo = {
            path: 'assets/perfil/',
            name: 'guilherme.jpg'
        },
        name = 'Luiz Guilherme',
        jobtitle = 'Analista Programador',
        phones = [
            '11 3683-3408',
            '11 98497-9536'
        ],
        whatsapp = {
            phone: '11 947841110',
            text: 'Olá tudo bem? como representante comercial do Grupo Mave, estou aqui para ajudar no que for possível. Qual sua dúvida?',
            message: 'Olá, este é o cartão de visita digital interativo do Grupo Mave. Tenha todas as informações a um clique. Acesse o link e saiba mais!'
        },
        vcard = {
            firstname: 'Luiz',
            lastname: 'Guilherme dos Santos',
            organization: 'Grupo Mave',
            photo: { path: 'assets/perfil/', name: 'guilherme.jpg' },
            logo: { path: 'assets/Logos/Grupo Mave/', name: 'logo_grupo_mave_faixa-cima.png' },
            workPhone: ['11 3683-3408', '(11) 99999-9999'],
            birthday: { year: 1999, month: 1, day: 17 },
            title: 'Analista Programador',
            url: 'https://grupomave.com.br',
            workUrl: "https://grupomavedigital.com.br",
            email: 'suporte@grupomave.com.br',
            label: 'Work Address',
            countryRegion: 'Brazil',
            street: 'R. Barão de Itaúna, 397 - Lapa, São Paulo - SP, 05078-080',
            city: 'São Paulo',
            stateProvince: 'São Paulo',
            postalCode: '05078-080',
            socialUrls: [
                {
                    media: "Youtube",
                    url: "https://www.youtube.com/channel/UC5y4IOAlxQ4eictbudG785g"
                },
                {
                    media: "Linkedin",
                    url: "https://www.linkedin.com/company/grupo-mave/?originalSubdomain=pt"
                },
                {
                    media: "Instagram",
                    url: "https://www.instagram.com/grupo.mave/"
                },
                {
                    media: "Facebook",
                    url: "https://www.facebook.com/grupomaveoficial/"
                }
            ],
            file: {
                path: 'vcf/',
                name: 'layout.vcf'
            }
        },
        footer = {
            email: 'ti@grupomave.com.br',
            location: 'R. Barão de Itaúna, 397 - Lapa, São Paulo - SP, 05078-080',
            website: 'https://grupomave.com.br',
            attachment: '/assets/Apresentação/APRESENTACAO_MAVE.pdf',
            socialmedia: [
                {
                    name: 'Youtube',
                    value: "https://www.youtube.com/channel/UC5y4IOAlxQ4eictbudG785g",
                    enabled: true
                },
                {
                    name: 'Linkedin',
                    value: "https://www.linkedin.com/company/grupo-mave/?originalSubdomain=pt",
                    enabled: true
                },
                {
                    name: 'Instagram',
                    value: "https://www.instagram.com/grupo.mave/",
                    enabled: true
                },
                {
                    name: 'Facebook',
                    value: "https://www.facebook.com/grupomaveoficial/",
                    enabled: true
                }
            ]
        }
    ) {
        return new Promise(async (resolve, reject) => {
            const { token, internetadress } = await window.app.storage_get_userInfo();

            fetch(window.app.graphqlUrl, {
                "method": "POST",
                "headers": {
                    "Content-Type": "application/json",
                    "authorization": "ji4H@Dr8MU*R@CramlVuyEFR9YiSlP1=veZ_7aFrUS$uFrAZomAs=ENi9I8oFasT",
                    "token": compressToEncodedURIComponent(token),
                    "internetadress": compressToEncodedURIComponent(internetadress),
                    "encodeuri": false
                },
                "body": JSON.stringify({
                    query: `mutation { url: cardUpdate(data: { \
                        id: \"${id}\" \
                        version: \"${version}\" \
                        photo: { path: \"${photo['path']}\", name: \"${photo['name']}\" } \
                        name: \"${name}\" \
                        jobtitle: \"${jobtitle}\" \
                        phones: [ \"${phones[0]}\", \"${phones[1]}\" ] \
                        whatsapp: { phone: \"${whatsapp['phone']}\", text: \"${whatsapp['text']}\", message: \"${whatsapp['message']}\" } \
                        vcard: { \
                            firstname: \"${vcard['firstname']}\" \
                            lastname: \"${vcard['lastname']}\" \
                            organization: \"${vcard['organization']}\" \
                            photo: { path: \"${vcard['photo']['path']}\", name: \"${vcard['photo']['name']}\" } \
                            logo: { path: \"${vcard['logo']['path']}\", name: \"${vcard['logo']['name']}\" } \
                            workPhone: [ \"${vcard['workPhone'][0]}\", \"${vcard['workPhone'][1]}\" ] \
                            birthday: { year: ${vcard['birthday']['year']}, month: ${vcard['birthday']['month']}, day: ${vcard['birthday']['day']} } \
                            title: \"${vcard['title']}\" \
                            url: \"${vcard['url']}\" \
                            workUrl: \"${vcard['workUrl']}\" \
                            email: \"${vcard['email']}\" \
                            label: \"${vcard['label']}\" \
                            countryRegion: \"${vcard['countryRegion']}\" \
                            street: \"${vcard['street']}\" \
                            city: \"${vcard['city']}\" \
                            stateProvince: \"${vcard['stateProvince']}\" \
                            postalCode: \"${vcard['postalCode']}\" \
                            socialUrls: [ ${arrayToString(vcard['socialUrls'])} ] \
                            file: { path: \"${vcard['file']['path']}\", name: \"${vcard['file']['name']}\" } \
                        } \
                        footer: { \
                            email: \"${footer['email']}\" \
                            location: \"${footer['location']}\" \
                            website: \"${footer['website']}\" \
                            attachment: \"${footer['attachment']}\" \
                            socialmedia: [ ${arrayToString(footer['socialmedia'], 'socialmedia')} ] \
                        } \
                    } ) }`
                })
            })
                .then(response => response.json())
                .then(({ data, errors }) => {
                    window.app.loading(false);

                    if (errors)
                        return errors.forEach(error => window.app.alerting(error.message));

                    resolve(data);
                })
                .catch(err => reject(err));
        })
    }

    function cardRemove(id) {
        return new Promise(async (resolve, reject) => {
            const { token, internetadress } = await window.app.storage_get_userInfo();

            fetch(window.app.graphqlUrl, {
                "method": "POST",
                "headers": {
                    "Content-Type": "application/json",
                    "authorization": "fRiphl8pus!uspEdr-zisepip1Uv63pucradisTeswEfru5LthIbr5rlv3dRosuv",
                    "token": compressToEncodedURIComponent(token),
                    "internetadress": compressToEncodedURIComponent(internetadress),
                    "encodeuri": false
                },
                "body": JSON.stringify({
                    query: `mutation { success: cardRemove(id: \"${id}\" ) }`
                })
            })
                .then(response => response.json())
                .then(({ data, errors }) => {
                    window.app.loading(false);

                    if (errors)
                        return errors.forEach(error => window.app.alerting(error.message));

                    resolve(data);
                })
                .catch(err => reject(err));
        })
    }

    // ======================================================================
    // Time
    //- Diferença entre horas
    function time_diference_hours(time1, time2) {
        let clock = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
            target = false,
            meeting = false,
            i = 0,
            next = 0;

        while (!target) {
            i++;

            if (clock[i] === undefined) i = 0;

            if (!meeting && time1 === clock[i]) meeting = true;

            if (meeting) {
                next++;

                if (time2 === clock[i]) target = true;
            }
        }

        return --next;
    }

    // ======================================================================
    // Filters
    //
    function filter_input(input_id, list_id, tag, tagFilters = []) {
        var
            input = document.getElementById(input_id || 'input-search'),
            filter, ul, li, a, i, txtValue;

        if (!input) return;

        ['keypress', 'keyup', 'keydown'].forEach(event =>
            input.addEventListener(event, function (e) {
                input = document.getElementById(input_id || 'input-search');
                filter = input.value.toUpperCase();
                ul = document.getElementById(list_id || "list-search");
                li = ul.getElementsByTagName(tag || "li");

                for (i = 0; i < li.length; i++) {
                    if (filter.length <= 0) {
                        $(li[i]).removeClass('d-none');
                        continue;
                    }

                    let filtered = false;

                    tagFilters.forEach(tagFilter => {
                        try {
                            a = li[i].getElementsByTagName(tagFilter)[0];
                            txtValue = a.textContent || a.innerText;

                            if (!filtered)
                                if (txtValue.toUpperCase().indexOf(filter) > -1) {
                                    $(li[i]).removeClass('d-none');
                                    filtered = true;
                                } else {
                                    $(li[i]).addClass('d-none');
                                }
                        } catch (error) {
                            console.error(error);
                            return window.app.alerting(`O filtro(${e.target}) está apresentando um erro.`);
                        }
                    })
                }
            })
        );
    };

    // ======================================================================
    // Password
    //
    function check_password(password = '') {
        return new Promise((resolve, reject) => {
            var strength = 0;

            if (password.match(/[a-z]+/)) {
                strength += 1;
            }

            if (password.match(/[A-Z]+/)) {
                strength += 1;
            }

            if (password.match(/[0-9]+/)) {
                strength += 1;
            }

            if (password.match(/[$@#&!]+/)) {
                strength += 1;
            }

            if (password.length < 6) {
                return reject("A senha deve conter no mínimo 6 caracteres.");
            }

            if (password.length > 256) {
                return reject("A senha deve conter no máximo 256 caracteres.");
            }

            if (strength < 4) {
                return reject("A senha deve conter no mínimo uma letra minúscula e maiúscula, um número e um caractere especial: $@#&!");
            }

            return resolve();
        });
    };

    // ======================================================================
    // Preferences
    //
    function openCanvasPreferences() {
        const offcanvas = new bootstrap.Offcanvas(document.getElementById('offcanvas_preferences'));
        offcanvas.show();
    };

    // ======================================================================
    // General Functions
    //
    async function gotoSystem() {
        const { token, internetadress } = await window.app.storage_get_userInfo();

        if (token) {
            let path = typeof window.app.pagedata('path') === 'string' ? window.app.pagedata('path') : '';

            document.location = `${window.app.baseurl}/system/${path}?usr_token=${token}&usr_internetadress=${internetadress}`;
        } else {
            document.location = `${window.app.baseurl}/user/auth`;
        };
    };

    function windowClose() {
        if (window)
            return window.close();
    };

    async function goto() {
        const { token, internetadress } = await window.app.storage_get_userInfo();

        if (token) {
            let path = typeof window.app.pagedata('path') === 'string' ? window.app.pagedata('path') : '';

            document.location = `${window.app.baseurl}/${path}?usr_token=${token}&usr_internetadress=${internetadress}`;
        } else {
            document.location = `${window.app.baseurl}/user/auth`;
        };
    };

    async function login() {
        await window.app.storage_clear_userInfo();

        window.app.localStorage().empty();

        document.location = `${window.app.baseurl}/user/auth`;
    };

    function help() {
        document.location = `${window.app.baseurl}/system/storage/hercules/help`;
    };

    function helpdesk() {
        return window.open(`https://grupomavedigital.com.br/glpi`, '_blank');
    };

    async function perfil() {
        const { token, internetadress } = await window.app.storage_get_userInfo();

        document.location = `${window.app.baseurl}/user/perfil?usr_token=${token}&usr_internetadress=${internetadress}`;
    };

    async function securityApp() {
        const { token, internetadress } = await window.app.storage_get_userInfo();

        document.location = `${window.app.baseurl}/user/auth/security?usr_token=${token}&usr_internetadress=${internetadress}`;
    };

    function cards() {
        return document.location = `${window.app.baseurl}/cards`;
    };

    async function cards_control() {
        const { token, internetadress } = await window.app.storage_get_userInfo();

        return document.location = `${window.app.baseurl}/cards/control?usr_token=${token}&usr_internetadress=${internetadress}`;
    };

    async function cards_register() {
        const { token, internetadress } = await window.app.storage_get_userInfo();

        return document.location = `${window.app.baseurl}/cards/register?usr_token=${token}&usr_internetadress=${internetadress}`;
    };

    async function app_meu_rh() {
        const { token, internetadress } = await window.app.storage_get_userInfo();

        document.location = `${window.app.baseurl}/system/rh/appMeuRH?usr_token=${token}&usr_internetadress=${internetadress}`;
    };

    async function manuals(id) {
        const { token, internetadress } = await window.app.storage_get_userInfo();

        document.location = `${window.app.baseurl}/system/manuals/${id}?usr_token=${token}&usr_internetadress=${internetadress}`;
    };

    async function materials(id) {
        const { token, internetadress } = await window.app.storage_get_userInfo();

        document.location = `${window.app.baseurl}/system/materials/${id}?usr_token=${token}&usr_internetadress=${internetadress}`;
    };

    async function cpanel() {
        const { token, internetadress } = await window.app.storage_get_userInfo();

        document.location = `${window.app.baseurl}/system/cpanel?usr_token=${token}&usr_internetadress=${internetadress}`;
    };

    async function cpanel_users_register() {
        const { token, internetadress } = await window.app.storage_get_userInfo();

        document.location = `${window.app.baseurl}/system/cpanel/users/register?usr_token=${token}&usr_internetadress=${internetadress}`;
    };

    async function hercules_openStorage(force) {
        const
            { token, internetadress } = await window.app.storage_get_userInfo(),
            parent = window.app.localStorage().get('hercules_openFolder');

        if (!force && parent) {
            window.app.localStorage().clear('hercules_openFolder');

            const { name, cid } = JSON.parse(decompressFromEncodedURIComponent(parent));

            return document.location = `${window.app.baseurl}/system/storage/hercules/folder/${encodeURIComponent(name)}/${encodeURIComponent(cid)}?usr_token=${token}&usr_internetadress=${internetadress}`;
        };

        document.location = `${window.app.baseurl}/system/storage/hercules?usr_token=${token}&usr_internetadress=${internetadress}`;
    };

    async function hercules_openFolder(name, cid, parent) {
        const { token, internetadress } = await window.app.storage_get_userInfo();

        if (parent)
            window.app.localStorage().save('hercules_openFolder', compressToEncodedURIComponent(JSON.stringify(parent)));

        document.location = `${window.app.baseurl}/system/storage/hercules/folder/${encodeURIComponent(name)}/${encodeURIComponent(cid)}?usr_token=${token}&usr_internetadress=${internetadress}`;
    };

    // ======================================================================
    // Globals (APP)
    //
    window.app = window.app || {};

    window.app.pagedata = function (prop) {
        let data = {}, values;

        if (document.getElementById('app-data-page')) {
            values = document.getElementById('app-data-page').classList;

            let name, type, value;

            values.forEach(item => {
                if (!name) name = item;
                else if (!type) type = item;
                else if (!value) value = item;

                if (name && type && value) {
                    if (String(type).toLowerCase() === 'stringpath')
                        data[name] = String(value).toLowerCase() != 'undefined' ? String(value) : false;

                    if (String(type).toLowerCase() === 'string')
                        data[name] = String(value);

                    if (String(type).toLowerCase() === 'number')
                        data[name] = Number(value);

                    name = null; type = null; value = null;
                }
            })
        }

        return prop ? data[prop] : data;
    };

    [
        { 'alias': 'DEFAULT_DELAY', 'function': DEFAULT_DELAY },
        { 'alias': 'ONE_SECOND_DELAY', 'function': ONE_SECOND_DELAY },
        { 'alias': 'MAIN_MENU', 'function': MAIN_MENU },
        { 'alias': 'baseurl', 'function': baseurl },
        { 'alias': 'cache', 'function': Cache },
        { 'alias': 'localStorage', 'function': () => { return { save: localStorage_save, get: localStorage_get, clear: localStorage_clear, empty: localStorage_empty } } },
        { 'alias': 'storage_get_userInfo', 'function': storage_get_userInfo },
        { 'alias': 'storage_set_userInfo', 'function': storage_set_userInfo },
        { 'alias': 'storage_clear_userInfo', 'function': storage_clear_userInfo },
        { 'alias': 'graphqlUrl', 'function': "__GULP__VARIABLE__GRAPHQL_URL__" },
        { 'alias': 'lockClosePage', 'function': lockClosePage },
        { 'alias': 'loading', 'function': loading },
        { 'alias': 'alerting', 'function': alerting },
        { 'alias': 'clearAlerting', 'function': clearAlerting },
        { 'alias': 'externalMailOpen', 'function': externalMailOpen },
        { 'alias': 'animateCSS', 'function': animateCSS },
        { 'alias': 'twofactor', 'function': twofactor },
        { 'alias': 'home', 'function': home },
        { 'alias': 'logout', 'function': logout },
        { 'alias': 'expired', 'function': expired },
        { 'alias': 'getUserEmail', 'function': getUserEmail },
        { 'alias': 'getFolderInfo', 'function': getFolderInfo },
        { 'alias': 'modalOpen', 'function': modalOpen },
        { 'alias': 'openModalSelect', 'function': openModalSelect },
        { 'alias': 'input', 'function': (options) => new Input(options) },
        { 'alias': 'formatMoney', 'function': formatMoney },
        { 'alias': 'stringPadZero', 'function': stringPadZero },
        { 'alias': 'fileUpload', 'function': fileUpload },
        { 'alias': 'fileContainValidExtensionAndSize', 'function': fileContainValidExtensionAndSize },
        { 'alias': 'valueClearCustomsCharacters', 'function': valueClearCustomsCharacters },
        { 'alias': 'vcardCreate', 'function': vcardCreate },
        { 'alias': 'cardCreate', 'function': cardCreate },
        { 'alias': 'cardUpdate', 'function': cardUpdate },
        { 'alias': 'cardRemove', 'function': cardRemove },
        { 'alias': 'time_diference_hours', 'function': time_diference_hours },
        { 'alias': 'filter_input', 'function': filter_input },
        { 'alias': 'check_password', 'function': check_password },
        { 'alias': 'gotoSystem', 'function': gotoSystem },
        { 'alias': 'windowClose', 'function': windowClose },
        { 'alias': 'goto', 'function': goto },
        { 'alias': 'login', 'function': login },
        { 'alias': 'help', 'function': help },
        { 'alias': 'helpdesk', 'function': helpdesk },
        { 'alias': 'perfil', 'function': perfil },
        { 'alias': 'securityApp', 'function': securityApp },
        { 'alias': 'cards', 'function': cards },
        { 'alias': 'cards_control', 'function': cards_control },
        { 'alias': 'cards_register', 'function': cards_register },
        { 'alias': 'app_meu_rh', 'function': app_meu_rh },
        { 'alias': 'manuals', 'function': manuals },
        { 'alias': 'materials', 'function': materials },
        { 'alias': 'cpanel', 'function': cpanel },
        { 'alias': 'cpanel_users_register', 'function': cpanel_users_register },
        { 'alias': 'hercules_openStorage', 'function': hercules_openStorage },
        { 'alias': 'hercules_openFolder', 'function': hercules_openFolder },
        { 'alias': 'openCanvasPreferences', 'function': openCanvasPreferences },
    ].forEach(prop => window.app[prop['alias']] = prop['function']);
})();