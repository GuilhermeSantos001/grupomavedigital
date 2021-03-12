(function () {
    "use strict";

    // ======================================================================
    // Default Variables
    //
    const
        DEFAULT_DELAY = 3600,
        ONE_SECOND_DELAY = 1000;

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
            }, ONE_SECOND_DELAY);
        } else {
            $("#spinnerLoading").animate({
                'marginTop': "-100vh"
            }, 720);

            $(".loadingDiv").fadeOut(1000, function () {
                $(".loadingDiv").remove();
            });
        }
    }

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

        if (saveCache) alerts.cache.push({ message, delay, callback });

        if (alerts.show) return;

        if (!alerts.interval)
            alerts.interval = setInterval(() => {
                if (alerts.show) return;

                if (alerts.cache.length > 0) {
                    alerts.cache.splice(0, 1);
                    return alerting(alerts.cache[0]['message'], alerts.cache[0]['delay'], alerts.cache[0]['callback'], false);
                }
                else
                    return clearInterval(alerts.interval), alerts.interval = null;
            }, ONE_SECOND_DELAY);

        $('body').append(`\
        <div style="z-index: 9999; font-size: 18px;" class="alertDiv alert alert-mave alert-dismissible fade show shadow fixed-top m-2" role="alert">\
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
                            <div class="modal-header"> \
                                <h5 class="modal-title">${title}</h5> \
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

    function sendemail(email) {
        return window.open(`mailto:${email}`, '_blank');
    }

    // ======================================================================
    // Authentication - TwoFactor
    //

    function twofactor(callback = () => { }, usr_auth) {
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
    }

    function retrievetwofactor(callback = () => { }, usr_auth) {
        window.app.loading(true);

        fetch(window.app.graphqlUrl, {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
                "authorization": "nlyachaglswisifrufrod0stEpec@UwlvizestAtr1xajanegaswa@remopheWip"
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
                throw new Error(err);
            });
    }

    // ======================================================================
    // Default Events
    //

    $(() => {
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

        defaultSetters();
        getLocationIP();

        setTimeout(() => {
            loading(false);
        }, ONE_SECOND_DELAY);
    })

    function defaultSetters() {
        if (document.getElementById('usr-username'))
            document.getElementById('usr-username').innerText = localStorage.getItem("usr-username");
    }

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
                localStorage.setItem('usr-internetadress', `${response['data']['ip']}`);
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
        window.app.loading(true);

        if (!localStorage.getItem('usr-auth') && !localStorage.getItem('usr-token'))
            return document.location = `${baseurl}/user/auth`;

        const
            usr_auth = LZString.compressToEncodedURIComponent(localStorage.getItem('usr-auth'));

        fetch(window.app.graphqlUrl, {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
                "authorization": "vlta#eke08uf=48uCuFustLr3ChL9a1*wrE_ayi0L*oFl-UHidlST8moj9f8C5L4",
                "token": LZString.compressToEncodedURIComponent(localStorage.getItem('usr-token')),
                "internetadress": LZString.compressToEncodedURIComponent(localStorage.getItem('usr-internetadress'))
            },
            "body": `{\"query\":\"query { authLogout(usr_auth: \\\"${usr_auth}\\\", usr_token: \\\"${LZString.compressToEncodedURIComponent(localStorage.getItem('usr-token'))}\\\") }\"}`
        })
            .then(response => response.json())
            .then(({ data, errors }) => {
                window.app.loading(false);

                if (errors)
                    return errors.forEach(error => window.app.alerting(error.message));

                if (data['authLogout']) {
                    localStorage.clear();
                    return document.location = `${baseurl}`;
                }
                else
                    return window.app.alerting('Não foi possível desconectar. Tente Novamente mais tarde!');
            })
            .catch(err => {
                throw new Error(err);
            });
    }

    function expired() {
        window.app.loading(true);

        if (!localStorage.getItem('usr-auth') && !localStorage.getItem('usr-token'))
            return document.location = `${baseurl}/user/auth`;

        const
            usr_auth = LZString.compressToEncodedURIComponent(localStorage.getItem('usr-auth'));

        fetch(window.app.graphqlUrl, {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
                "authorization": "5wEvlBR8TRuxePL42thecuv8sP3Pe4lB56EzLBra9Iph9WiPRId3ONL20uK7T#Ip",
                "token": LZString.compressToEncodedURIComponent(localStorage.getItem('usr-token')),
                "internetadress": LZString.compressToEncodedURIComponent(localStorage.getItem('usr-internetadress'))
            },
            "body": `{\"query\":\"query { authExpired(usr_auth: \\\"${usr_auth}\\\", usr_token: \\\"${LZString.compressToEncodedURIComponent(localStorage.getItem('usr-token'))}\\\") }\"}`
        })
            .then(response => response.json())
            .then(({ data, errors }) => {
                window.app.loading(false);

                if (errors)
                    return errors.forEach(error => window.app.alerting(error.message));

                if (data['authExpired']) {
                    localStorage.clear();
                    return document.location = `${baseurl}/user/auth`;
                }
                else
                    return window.app.alerting('Não foi possível desconectar. Tente Novamente mais tarde!');
            })
            .catch(err => {
                throw new Error(err);
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
                    }, ONE_SECOND_DELAY);
                });
            })
        }
    }

    // ======================================================================
    // Storage
    //

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

    // ======================================================================
    // File - Upload
    //
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
        return new Promise((resolve, reject) => {
            fetch(window.app.graphqlUrl, {
                "method": "POST",
                "headers": {
                    "Content-Type": "application/json",
                    "authorization": "fA=ireb506d@lgAdA9&OfaSawro?a_11rajo_+dud@uph_k1gasweprut-owr+br",
                    "token": LZString.compressToEncodedURIComponent(localStorage.getItem('usr-token')),
                    "internetadress": LZString.compressToEncodedURIComponent(localStorage.getItem('usr-internetadress'))
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
        return new Promise((resolve, reject) => {
            fetch(window.app.graphqlUrl, {
                "method": "POST",
                "headers": {
                    "Content-Type": "application/json",
                    "authorization": "6T9YEPuTRu3e0aQevEdeVA8r1Dr&8RAFReSud0&Huhld##*&E#==E*OBr2&h$wEC",
                    "token": LZString.compressToEncodedURIComponent(localStorage.getItem('usr-token')),
                    "internetadress": LZString.compressToEncodedURIComponent(localStorage.getItem('usr-internetadress'))
                },
                "body": JSON.stringify({
                    query: `mutation { url: cardCreate(data: { \
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
        return new Promise((resolve, reject) => {
            fetch(window.app.graphqlUrl, {
                "method": "POST",
                "headers": {
                    "Content-Type": "application/json",
                    "authorization": "ji4H@Dr8MU*R@CramlVuyEFR9YiSlP1=veZ_7aFrUS$uFrAZomAs=ENi9I8oFasT",
                    "token": LZString.compressToEncodedURIComponent(localStorage.getItem('usr-token')),
                    "internetadress": LZString.compressToEncodedURIComponent(localStorage.getItem('usr-internetadress'))
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
        return new Promise((resolve, reject) => {
            fetch(window.app.graphqlUrl, {
                "method": "POST",
                "headers": {
                    "Content-Type": "application/json",
                    "authorization": "fRiphl8pus!uspEdr-zisepip1Uv63pucradisTeswEfru5LthIbr5rlv3dRosuv",
                    "token": LZString.compressToEncodedURIComponent(localStorage.getItem('usr-token')),
                    "internetadress": LZString.compressToEncodedURIComponent(localStorage.getItem('usr-internetadress'))
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
    //

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
    }

    // ======================================================================
    // General Functions
    //
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
        document.location = `${window.app.baseurl}/user/auth`;
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

    function cards() {
        return document.location = `${window.app.baseurl}/cards`;
    }

    function cards_control() {
        return document.location = `${window.app.baseurl}/cards/control?usr_token=${localStorage.getItem('usr-token')}&usr_internetadress=${localStorage.getItem('usr-internetadress')}`;
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
        { 'alias': 'DEFAULT_DELAY', 'function': DEFAULT_DELAY },
        { 'alias': 'ONE_SECOND_DELAY', 'function': ONE_SECOND_DELAY },
        { 'alias': 'baseurl', 'function': baseurl },
        { 'alias': 'graphqlUrl', 'function': baseurl.replace(':3000', ':4080') },
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
        { 'alias': 'openModalSelect', 'function': openModalSelect },
        { 'alias': 'formatMoney', 'function': formatMoney },
        { 'alias': 'StringPadZero', 'function': StringPadZero },
        { 'alias': 'create_notifications', 'function': create_notifications },
        { 'alias': 'storage_menu_compare', 'function': storage_menu_compare },
        { 'alias': 'storage_menu_start', 'function': storage_menu_start },
        { 'alias': 'fileUpload', 'function': fileUpload },
        { 'alias': 'vcardCreate', 'function': vcardCreate },
        { 'alias': 'cardCreate', 'function': cardCreate },
        { 'alias': 'cardUpdate', 'function': cardUpdate },
        { 'alias': 'cardRemove', 'function': cardRemove },
        { 'alias': 'time_diference_hours', 'function': time_diference_hours },
        { 'alias': 'filter_input', 'function': filter_input },
        { 'alias': 'gotoSystem', 'function': gotoSystem },
        { 'alias': 'login', 'function': login },
        { 'alias': 'perfil', 'function': perfil },
        { 'alias': 'securityApp', 'function': securityApp },
        { 'alias': 'cards', 'function': cards },
        { 'alias': 'cards_control', 'function': cards_control },
        { 'alias': 'cards_register', 'function': cards_register }
    ].forEach(prop => window.app[prop['alias']] = prop['function']);
})();