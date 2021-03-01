(function () {
    "use strict";

    function lockClosePage() {
        return window.onbeforeunload = function (e) {
            // Cancelar o evento
            e.preventDefault(); // Se você impedir o comportamento padrão no Mozilla Firefox, o prompt será sempre mostrado
            // O Chrome requer que returnValue seja definido
            e.returnValue = '';
        };
    }

    function loading(state) {
        if (state) {
            $('body').append('\
            <div style="z-index: 9999; height: 100vh; opacity: 0;" class="loadingDiv card bg-loading fixed-top col-12">\
              <div class="card-body" style="margin-top: -100vh;" id="spinnerLoading">\
                <div class="d-flex justify-content-center">\
                  <div class="spinner-border" style="width: 10rem; height: 10rem;" role="status">\
                    <span class="visually-hidden">Loading...</span>\
                  </div>\
                </div>\
              </div>\
            </div>\
            ');
            $("#spinnerLoading").animate({
                'marginTop': 0
            }, 720);

            $(".loadingDiv").animate({
                'opacity': 1
            }, 1000);
        } else {
            $("#spinnerLoading").animate({
                'marginTop': "-100vh"
            }, 720);

            $(".loadingDiv").fadeOut(1000, function () {
                $(".loadingDiv").remove();
            });
        }
    }

    function alerting(message = '???', delay = 3000, callback = function () { }) {
        $('body').append(`\
        <div style="z-index: 9999;" class="alertDiv alert alert-secondary alert-dismissible fade show fixed-top m-2" role="alert">\
          <strong>${message}</strong>\
        </div>\
        `);

        setTimeout(function () {
            $('.alertDiv').fadeOut("slow", function () {
                $('.alertDiv').remove();
                callback();
            });
        }, delay);
    }

    function clearAlerting(callback = function () { }) {
        $('.alertDiv').fadeOut("slow", function () {
            $('.alertDiv').remove();
            callback();
        });
    }

    function sendemail(email) {
        return window.open(`mailto:${email}`, '_blank');
    }

    function twofactor(callback = () => { }, usr_authorization) {
        $('body').append(`\
        <div style="z-index: 9999; height: 100vh; opacity: 0;" class="twofactorDiv bg-alert fixed-top col-12 overflow-auto"> \
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
                        }, 1000)
                        .delay(3000)
                        .animate({
                            'opacity': 0
                        }, 1000);
                }, usr_authorization);
        };

        $(".twofactorDiv").animate({
            'opacity': 1
        }, 1000);
    }

    function retrievetwofactor(callback = () => { }, usr_authorization) {
        axios.request({
            method: 'POST',
            url: `${baseurl}/user/auth/security/retrieve/twofactor`,
            headers: {
                "Content-Type": "application/json"
            },
            data: {
                usr_authorization
            }
        })
            .then(() => {
                callback(true);
            })
            .catch(error => {
                if (error.response && error.response.data && error.response.data.error != undefined) {
                    console.log(error.response.data);
                } else {
                    console.log(error);
                }

                callback(false);
            })
    }

    $(document).ready(() => {
        setTimeout(() => {
            if (localStorage.getItem('usr-token')) {
                load_notifications();
                console.log(localStorage.getItem('usr-token'));
            }
        }, 180000);

        $(window).scroll(function () {
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

        getLocationIP();

        setTimeout(() => {
            loading(false);
        }, 1000);
    })

    var baseurl = String(location.origin);

    loading(true);

    function getLocationIP() {
        axios.request({
            method: 'GET',
            url: `${baseurl}/ipinfo`,
            headers: {
                "Content-Type": "application/json"
            },
            data: {}
        })
            .then(response => {
                localStorage.setItem('usr-locationIP', `${response['data']['country']}(${response['data']['city']}/${response['data']['region']})`);
                localStorage.setItem('usr-internetadress', LZString.compressToEncodedURIComponent(`${response['data']['ip']}`));
            })
            .catch(error => {
                alerting(`Ocorreu um erro inesperado, fale com o administrador do sistema.`);
                console.log(error);
                loading(false);
            })
    }

    function home() {
        return document.location = `${window.app.baseurl}`;
    }

    function logout() {
        loading(true);

        if (!localStorage.getItem('usr-token'))
            return document.location = `${baseurl}/user/auth`;

        axios.request({
            method: 'POST',
            url: `${baseurl}/user/auth/logout`,
            headers: {
                "Content-Type": "application/json",
                "usr_token": localStorage.getItem('usr-token'),
                "usr_internetadress": localStorage.getItem('usr-internetadress')
            },
            data: {
                logout: true
            }
        })
            .then(() => {
                localStorage.clear();
                document.location = `${baseurl}/user/auth`;
            })
            .catch(error => {
                alerting(`Ocorreu um erro inesperado, fale com o administrador do sistema.`);
                console.log(error);
                loading(false);
            })
    }

    function expired() {
        loading(true);

        if (!localStorage.getItem('usr-auth') && !localStorage.getItem('usr-token'))
            return document.location = `${baseurl}/user/auth`;

        const gotoAuth = () => {
            localStorage.clear();
            document.location = `${baseurl}/user/auth`;
        }

        axios.request({
            method: 'POST',
            url: `${baseurl}/user/auth/expired`,
            headers: {
                "Content-Type": "application/json"
            },
            data: {
                usr_authorization: localStorage.getItem('usr-auth'),
                usr_token: localStorage.getItem('usr-token')
            }
        })
            .then(gotoAuth.call(this))
            .catch(gotoAuth.call(this))
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

    function StringPadZero(str, length) {
        var s = String(str);
        while (s.length < length) {
            s = '0' + s;
        }
        return s;
    }

    /**
      Notification System
    */
    let notifications = [],
        notification_timeout = null;

    function load_notifications() {
        if (localStorage.getItem('usr-token'))
            axios.request({
                method: 'GET',
                url: `${baseurl}/user/notifications`,
                headers: {
                    "Content-Type": "application/json",
                    "usr_token": localStorage.getItem('usr-token'),
                    "usr_internetadress": localStorage.getItem('usr-internetadress')
                },
                params: {}
            })
                .then(response => {
                    notifications = response['data']['notifications'] || [];
                    process_notifications();
                })
                .catch(error => {
                    if (error.response && error.response.data && error.response.data.error != undefined) {
                        console.log('Erro no sistema de notificação', error.response.data);
                    } else {
                        console.log('Erro no sistema de notificação', error);
                    }
                })
    }

    function create_notifications(authorization = localStorage.getItem('usr-token'), title = '???', subtitle = '???', body = '???', background = 'secondary', expires = '1 min') {
        axios.request({
            method: 'POST',
            url: `${baseurl}/user/notifications/create`,
            headers: {
                "Content-Type": "application/json",
                "usr_token": localStorage.getItem('usr-token'),
                "usr_internetadress": localStorage.getItem('usr-internetadress')
            },
            data: {
                authorization: String(authorization),
                title: String(title),
                subtitle: String(subtitle),
                body: String(body),
                background: String(background),
                expires: String(expires)
            }
        })
            .then(response => { })
            .catch(error => {
                if (error.response && error.response.data && error.response.data.error != undefined) {
                    console.log('Erro no sistema de notificação', error.response.data);
                } else {
                    console.log('Erro no sistema de notificação', error);
                }
            })
    }

    function remove_notifications(indexOf) {
        axios.request({
            method: 'POST',
            url: `${baseurl}/user/notifications/remove`,
            headers: {
                "Content-Type": "application/json",
                "usr_token": localStorage.getItem('usr-token'),
                "usr_internetadress": localStorage.getItem('usr-internetadress')
            },
            data: {
                id: Number(indexOf)
            }
        })
            .then(response => {
                console.log(response);
            })
            .catch(error => {
                if (error.response && error.response.data && error.response.data.error != undefined) {
                    console.log('Erro no sistema de notificação', error.response.data);
                } else {
                    console.log('Erro no sistema de notificação', error);
                }
            })
    }

    function process_notifications() {
        if (notifications.length > 0) {
            let notification = notifications[0];

            $('body').append(`\
          <div style="z-index: 9999; height: 100vh;" class="notificationDiv card bg-alert fixed-top col-12">\
            <div id="notification-alert-box" class="alert alert-${notification['background']} alert-dismissible fade show m-auto mx-auto overflow-auto" role="alert" style="width: 90vw; height: 90vh;">\
              <h5 class="alert-heading text-break"><span class="material-icons">notification_important</span> ${notification['title']}</h5>\
              <hr>\
              <h6>${notification['subtitle']}</h6>\
              <hr>\
              <div class="bg-dark text-white">\
                <h5 class="text-white text-start p-3" style="white-space: pre-wrap;">${notification['body']}</h5>\
              </div>\
              <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>\
            </div>\
          </div>\
          `);

            $('#notification-alert-box').on('closed.bs.alert', function () {
                notifications.splice(0, 1);
                remove_notifications(0);

                $('.notificationDiv').fadeOut("slow", function () {
                    $('.notificationDiv').remove();
                    notification_timeout = setTimeout(() => {
                        process_notifications();
                        clearTimeout(notification_timeout);
                    }, 1000);
                });
            })
        }
    }

    /**
      Storage Menu
    **/

    function storage_menu_set(menu = '', value = false) {
        if (menu === '')
            return false;

        return localStorage.setItem(`app-menu-${menu}`, value);
    }

    function storage_menu_get(menu = '') {
        if (menu === '')
            return false;

        return localStorage.getItem(`app-menu-${menu}`);
    }

    function storage_menu_compare(menu = '', value = false) {
        if (menu === '')
            return false;

        return localStorage.getItem(`app-menu-${menu}`) === value;
    }

    function storage_menu_start(menu = '???') {
        if (storage_menu_get(menu) != undefined)
            document.getElementById(`nav-${storage_menu_get(menu)}-tab`).click();

        $('a.menu-storage.nav-link').click(function (event) {
            let id = event.target['id'],
                regex = new RegExp('-(.*?)-', 'g'),
                result;

            while ((result = regex.exec(id))) {
                storage_menu_set(menu, result[1]);
            }
        })
    }

    /**
     * File
     */
    let uploadProcess = null;
    function fileUpload(files = [], custompath) {
        return new Promise((resolve, reject) => {
            if (uploadProcess || files.length <= 0) return;

            const formData = new FormData();

            formData.append('attachment', files[0]);

            fetch(`${baseurl}/system/upload/file`, {
                "method": "POST",
                "headers": {
                    "usr_token": localStorage.getItem('usr-token'),
                    "usr_internetadress": localStorage.getItem('usr-internetadress'),
                    "custompath": custompath
                },
                "body": formData
            })
                .then(response => {
                    response.json().then(data => {
                        return resolve(data);
                    })
                })
                .catch(error => reject(error))
        })
    };

    /**
     * vCard
     */
    function vcardCreate(
        firstName = 'Luiz',
        lastName = 'Guilherme dos Santos',
        organization = 'Grupo Mave',
        photo = { path: 'assets/perfil/', file: 'guilherme.jpg' },
        logo = { path: 'assets/Logos/Grupo Mave/', file: 'logo_grupo_mave_faixa-cima.png' },
        workPhone = ['11 3683-3408', '(11) 99999-9999'],
        birthday = { year: 1999, month: 1, day: 17 },
        title = 'Analista Programador',
        url = 'https://grupomave.com.br',
        email = 'suporte@grupomave.com.br',
        street = 'R. Barão de Itaúna, 397 - Lapa, São Paulo - SP, 05078-080',
        city = 'São Paulo',
        stateProvince = 'São Paulo',
        postalCode = '05078-080',
        socialUrls = {
            'youtube': 'https://www.youtube.com/channel/UC5y4IOAlxQ4eictbudG785g',
            'linkedin': 'https://www.linkedin.com/company/grupo-mave/?originalSubdomain=pt',
            'instagram': 'https://www.instagram.com/grupo.mave/',
            'facebook': 'https://www.facebook.com/grupomaveoficial/'
        }
    ) {
        return new Promise((resolve, reject) => {
            axios.request({
                method: 'POST',
                url: `${baseurl}/cards/vcard/register`,
                headers: {
                    "Content-Type": "application/json",
                    "usr_token": localStorage.getItem('usr-token'),
                    "usr_internetadress": localStorage.getItem('usr-internetadress')
                },
                data: {
                    firstName: String(firstName),
                    lastName: String(lastName),
                    organization: String(organization),
                    photo: { path: photo.path, file: photo.file },
                    logo: { path: logo.path, file: logo.file },
                    workPhone: workPhone,
                    birthday: { year: birthday.year, month: birthday.month, day: birthday.day },
                    title: String(title),
                    url: String(url),
                    email: String(email),
                    street: String(street),
                    city: String(city),
                    stateProvince: String(stateProvince),
                    postalCode: String(postalCode),
                    socialUrls: socialUrls
                }
            })
                .then(res => resolve(res.data))
                .catch(error => {
                    if (error.response && error.response.data && error.response.data.error != undefined) {
                        return reject('Erro na criação do vCard', error.response.data)
                    } else {
                        return reject('Erro na criação do vCard', error)
                    }
                })
        })
    }

    /**
      Time
    **/

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

    function gotoSystem() {
        if (localStorage.getItem('usr-token')) {
            let path = typeof window.app.pagedata('path') === 'string' ? window.app.pagedata('path') : '';

            document.location = `${window.app.baseurl}/system${path}?usr_token=${localStorage.getItem('usr-token')}&usr_internetadress=${localStorage.getItem('usr-internetadress')}`;
        } else {
            document.location = `${window.app.baseurl}/user/auth`;
        }
    }

    function login() {
        localStorage.clear();
        document.location = `${baseurl}/user/auth`;
    }

    function admin() {
        document.location = `${window.app.baseurl}/system/admin?usr_token=${localStorage.getItem('usr-token')}&usr_internetadress=${localStorage.getItem('usr-internetadress')}`;
    }

    function perfil() {
        document.location = `${window.app.baseurl}/user/perfil?usr_token=${localStorage.getItem('usr-token')}&usr_internetadress=${localStorage.getItem('usr-internetadress')}`;
    }

    function docs() {
        document.location = `${window.app.baseurl}/user/docs?usr_token=${localStorage.getItem('usr-token')}&usr_internetadress=${localStorage.getItem('usr-internetadress')}`;
    }

    function budgets() {
        document.location = `${window.app.baseurl}/system/budgets?usr_token=${localStorage.getItem('usr-token')}&usr_internetadress=${localStorage.getItem('usr-internetadress')}`;
    }

    function clients() {
        document.location = `${window.app.baseurl}/system/clients?usr_token=${localStorage.getItem('usr-token')}&usr_internetadress=${localStorage.getItem('usr-internetadress')}`;
    }

    function aliquots() {
        document.location = `${window.app.baseurl}/system/aliquots?usr_token=${localStorage.getItem('usr-token')}&usr_internetadress=${localStorage.getItem('usr-internetadress')}`;
    }

    function esocial() {
        document.location = `${window.app.baseurl}/system/esocial?usr_token=${localStorage.getItem('usr-token')}&usr_internetadress=${localStorage.getItem('usr-internetadress')}`;
    }

    function benefits() {
        document.location = `${window.app.baseurl}/system/benefits?usr_token=${localStorage.getItem('usr-token')}&usr_internetadress=${localStorage.getItem('usr-internetadress')}`;
    }

    function uniforms() {
        document.location = `${window.app.baseurl}/system/uniforms?usr_token=${localStorage.getItem('usr-token')}&usr_internetadress=${localStorage.getItem('usr-internetadress')}`;
    }

    function workdata() {
        document.location = `${window.app.baseurl}/system/workdata?usr_token=${localStorage.getItem('usr-token')}&usr_internetadress=${localStorage.getItem('usr-internetadress')}`;
    }

    function equipments() {
        document.location = `${window.app.baseurl}/system/equipments?usr_token=${localStorage.getItem('usr-token')}&usr_internetadress=${localStorage.getItem('usr-internetadress')}`;
    }

    function rents() {
        document.location = `${window.app.baseurl}/system/rents?usr_token=${localStorage.getItem('usr-token')}&usr_internetadress=${localStorage.getItem('usr-internetadress')}`;
    }

    function fuel() {
        document.location = `${window.app.baseurl}/system/fuel?usr_token=${localStorage.getItem('usr-token')}&usr_internetadress=${localStorage.getItem('usr-internetadress')}`;
    }

    function securityApp() {
        document.location = `${window.app.baseurl}/user/auth/security?usr_token=${localStorage.getItem('usr-token')}&usr_internetadress=${localStorage.getItem('usr-internetadress')}`;
    }

    function helpApp() {
        document.location = `${window.app.baseurl}/system/help?usr_token=${localStorage.getItem('usr-token')}&usr_internetadress=${localStorage.getItem('usr-internetadress')}`;
    }

    function cards_register() {
        return document.location = `${window.app.baseurl}/cards/register?usr_token=${localStorage.getItem('usr-token')}&usr_internetadress=${localStorage.getItem('usr-internetadress')}`;
    }

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
        { 'alias': 'baseurl', 'function': baseurl },
        { 'alias': 'lockClosePage', 'function': lockClosePage },
        { 'alias': 'loading', 'function': loading },
        { 'alias': 'alerting', 'function': alerting },
        { 'alias': 'clearAlerting', 'function': clearAlerting },
        { 'alias': 'sendemail', 'function': sendemail },
        { 'alias': 'twofactor', 'function': twofactor },
        { 'alias': 'home', 'function': home },
        { 'alias': 'logout', 'function': logout },
        { 'alias': 'expired', 'function': expired },
        { 'alias': 'modalOpen', 'function': modalOpen },
        { 'alias': 'formatMoney', 'function': formatMoney },
        { 'alias': 'StringPadZero', 'function': StringPadZero },
        { 'alias': 'create_notifications', 'function': create_notifications },
        { 'alias': 'storage_menu_compare', 'function': storage_menu_compare },
        { 'alias': 'storage_menu_start', 'function': storage_menu_start },
        { 'alias': 'fileUpload', 'function': fileUpload },
        { 'alias': 'vcardCreate', 'function': vcardCreate },
        { 'alias': 'time_diference_hours', 'function': time_diference_hours },
        { 'alias': 'gotoSystem', 'function': gotoSystem },
        { 'alias': 'login', 'function': login },
        { 'alias': 'perfil', 'function': perfil },
        { 'alias': 'cards_register', 'function': cards_register },
    ].forEach(prop => window.app[prop['alias']] = prop['function']);
})();