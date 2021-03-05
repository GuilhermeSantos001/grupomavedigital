(function () {
    "use strict";

    // ======================================================================
    // Import of Globals(APP)
    //
    window.app = window.app || {};

    $(document).ready(() => {
        $('\
          #password-actual, \
          #password-new, \
          #password-new-confirm \
        ').on('change', function () {
            if (
                $('#password-actual').val().length > 0 &&
                $('#password-new').val().length > 0 &&
                $('#password-new-confirm').val().length > 0 &&
                $('#password-new').val() == $('#password-new-confirm').val()
            ) {
                $('#button-define-new-password').attr('disabled', false);
            } else if (
                $('#password-new').val().length > 0 &&
                $('#password-new-confirm').val().length > 0 &&
                $('#password-new').val() !== $('#password-new-confirm').val()
            ) {
                $('#password-new, #password-new-confirm').addClass('is-invalid');
                alerting('As senhas não coincidem!', 3000, () => { $('#password-new, #password-new-confirm').removeClass('is-invalid'); });
            }
        });

        document.getElementById('button-define-new-password').onclick = function () {
            window.app.loading(true);

            const
                usr_auth = LZString.compressToEncodedURIComponent(localStorage.getItem('usr-auth')),
                usr_pwd = LZString.compressToEncodedURIComponent($('#password-actual').val()),
                usr_newPwd = LZString.compressToEncodedURIComponent($('#password-new').val());

            if (usr_auth.length <= 0 || usr_pwd.length <= 0 || usr_newPwd.length <= 0) {
                window.app.loading(false);

                if (!$('#password-actual, #password-new').hasClass('is-invalid')) {
                    $('#password-actual, #password-new').addClass('is-invalid');
                    let clear = setTimeout(function () {
                        $('#password-actual, #password-new').removeClass('is-invalid');
                        clearTimeout(clear);
                    }, window.app.DEFAULT_DELAY);
                }

                return window.app.alerting('Preencha os campos obrigatórios. Tente novamente!')
            }

            fetch(window.app.graphqlUrl, {
                "method": "POST",
                "headers": {
                    "Content-Type": "application/json",
                    "authorization": "SweteNlPut4uqlBiwIchiXafe1ld1bRICriBra7iPRazOs0ItRAtiwriyoyuyo-u"
                },
                "body": `\
                {\"mutation\":\
                \"{ changePassword(\
                    usr_auth: \\\"${usr_auth}\\\", \
                    pwd: \\\"${usr_pwd}\\\", \
                    new_pwd: \\\"${usr_newPwd}\\\") \
                }\"}`
            })
                .then(response => response.json())
                .then(({ data, errors }) => {
                    window.app.loading(false);

                    if (errors)
                        return errors.forEach(error => window.app.alerting(error.message));

                    return window.app.alerting(data);
                })
                .catch(err => {
                    throw new Error(err);
                });
        };
    })

    function showQRCode(qrcode = '???') {
        $('body').append(`\
        <div style="z-index: 9999; height: 100vh; opacity: 0;" class="twofactor bg-twofactor fixed-top col-12 overflow-auto"> \
          <h1 class="text-white text-center fs-1 fw-bold m-5">Escaneie o seu QRCode com um aplicativo de autenticação, por exemplo, Google Authenticator.</h1><br />\
          <img src="${qrcode}" class="img-thumbnail border border-5 border-primary mx-auto mb-2 d-block" alt="Escaneie seu QRCODE"><br/> \
          <div class="col-10 mx-auto mb-5"> \
            <label for="qrcode-usertoken">Insira o código que aparece em seu visor</label> \
            <input type="tel" class="form-control mb-2" id="qrcode-usertoken"> \
            <button type="button" class="btn btn-mave1 col-12" onclick="verifytwofactor()">Validar</button> \
        </div>\
        `);

        setTimeout(function () {
            $('.twofactor').animate({ opacity: 1 }, "slow");
        }, 1000);
    }

    function signtwofactor() {
        loading(true);

        if (!localStorage.getItem('usr-auth') && !localStorage.getItem('usr-token'))
            return document.location = `${baseurl}/user/auth`;

        axios.request({
            method: 'POST',
            url: `${baseurl}/user/auth/security/sign/twofactor`,
            headers: {
                "Content-Type": "application/json",
                "usr_token": localStorage.getItem('usr-token'),
                "usr_internetadress": localStorage.getItem('usr-internetadress')
            },
            data: {
                usr_authorization: localStorage.getItem('usr-auth')
            }
        })
            .then(response => {
                loading(false);

                try {
                    showQRCode(response['data']['qrcode']);
                } catch (err) {
                    alerting(`Não foi possível gerar seu QRCode, fale com o administrador do sistema.`);
                    console.log(err);
                }
            })
            .catch(error => {
                alerting(`Ocorreu um erro inesperado, fale com o administrador do sistema.`);
                console.log(error);
                loading(false);
            })
    }

    function verifytwofactor() {
        loading(true);

        if (!localStorage.getItem('usr-auth') && !localStorage.getItem('usr-token'))
            return document.location = `${baseurl}/user/auth`;

        axios.request({
            method: 'POST',
            url: `${baseurl}/user/auth/security/verify/twofactor`,
            headers: {
                "Content-Type": "application/json",
                "usr_token": localStorage.getItem('usr-token'),
                "usr_internetadress": localStorage.getItem('usr-internetadress')
            },
            data: {
                usr_authorization: localStorage.getItem('usr-auth'),
                usertoken: $('#qrcode-usertoken').val()
            }
        })
            .then(response => {
                loading(false);

                try {
                    if (!response['data']) {
                        alerting(`Seu código não está correto, tente novamente.`);
                    } else {
                        $(".twofactor").fadeOut(500, function () {
                            $(".twofactor").remove();
                            enabledtwofactor();
                        });
                    }
                } catch (err) {
                    alerting(`Não foi possível verificar seu código, tente novamente mais tarde.`);
                    console.log(err);
                }
            })
            .catch(error => {
                alerting(`Ocorreu um erro inesperado, fale com o administrador do sistema.`);
                console.log(error);
                loading(false);
            })
    }

    function enabledtwofactor() {
        loading(true);

        if (!localStorage.getItem('usr-auth') && !localStorage.getItem('usr-token'))
            return document.location = `${baseurl}/user/auth`;

        axios.request({
            method: 'POST',
            url: `${baseurl}/user/auth/security/enabled/twofactor`,
            headers: {
                "Content-Type": "application/json",
                "usr_token": localStorage.getItem('usr-token'),
                "usr_internetadress": localStorage.getItem('usr-internetadress')
            },
            data: {
                usr_authorization: localStorage.getItem('usr-auth')
            }
        })
            .then(() => {
                loading(false);
                alerting(`Sua autenticação de dois fatores, está ativada!`, 1000, function () { document.location.reload(); });
            })
            .catch(error => {
                alerting(`Ocorreu um erro inesperado, fale com o administrador do sistema.`);
                console.log(error);
                loading(false);
            })
    }

    function disabledtwofactor() {
        loading(true);

        if (!localStorage.getItem('usr-auth') && !localStorage.getItem('usr-token'))
            return document.location = `${baseurl}/user/auth`;

        axios.request({
            method: 'POST',
            url: `${baseurl}/user/auth/security/disabled/twofactor`,
            headers: {
                "Content-Type": "application/json",
                "usr_token": localStorage.getItem('usr-token'),
                "usr_internetadress": localStorage.getItem('usr-internetadress')
            },
            data: {
                usr_authorization: localStorage.getItem('usr-auth')
            }
        })
            .then(() => {
                loading(false);
                alerting(`Sua autenticação de dois fatores, está desativada!`, 1000, function () { document.location.reload(); });
            })
            .catch(error => {
                alerting(`Ocorreu um erro inesperado, fale com o administrador do sistema.`);
                console.log(error);
                loading(false);
            })
    }

    // ======================================================================
    // Export to Globals(APP)
    //
    [
        { 'alias': 'signtwofactor', 'function': signtwofactor },
        { 'alias': 'disabledtwofactor', 'function': disabledtwofactor },
    ].forEach(prop => window.app[prop['alias']] = prop['function']);
})();