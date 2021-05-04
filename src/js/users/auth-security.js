(function () {
    "use strict";

    // ======================================================================
    // Import of Globals(APP)
    //
    window.app = window.app || {};

    $(() => {
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
                window.app.check_password($('#password-new').val())
                    .then(() => {
                        $('#button-define-new-password').attr('disabled', false);
                    })
                    .catch(error => window.app.alerting(error));
            } else if (
                $('#password-new').val().length > 0 &&
                $('#password-new-confirm').val().length > 0 &&
                $('#password-new').val() !== $('#password-new-confirm').val()
            ) {
                $('#password-new, #password-new-confirm').addClass('is-invalid');
                window.app.alerting('As senhas não coincidem!', 3000, () => { $('#password-new, #password-new-confirm').removeClass('is-invalid'); });
            }
        });

        document.getElementById('button-define-new-password').onclick = async function () {
            window.app.loading(true);

            const { auth, token, internetadress } = await window.app.storage_get_userInfo();

            let
                usr_pwd = $('#password-actual').val(),
                usr_newPwd = $('#password-new').val();

            if (usr_pwd.length <= 0 || usr_newPwd.length <= 0) {
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

            const usr_auth = LZString.compressToEncodedURIComponent(auth);

            usr_pwd = LZString.compressToEncodedURIComponent($('#password-actual').val());
            usr_newPwd = LZString.compressToEncodedURIComponent($('#password-new').val());

            fetch(window.app.graphqlUrl, {
                "method": "POST",
                "headers": {
                    "Content-Type": "application/json",
                    "authorization": "Re94FUC3phicraR94Tuq5@0Sto16sp4swa7I1As5uChEmUhExuvATrovic5lfic",
                    "token": LZString.compressToEncodedURIComponent(token),
                    "internetadress": LZString.compressToEncodedURIComponent(internetadress),
                    "encodeuri": true
                },
                "body": `{\"query\":\"mutation { changePassword(usr_auth: \\\"${usr_auth}\\\", pwd: \\\"${usr_pwd}\\\", new_pwd: \\\"${usr_newPwd}\\\") }\"}`
            })
                .then(response => response.json())
                .then(({ data, errors }) => {
                    window.app.loading(false);

                    if (errors)
                        return errors.forEach(error => window.app.alerting(error.message));

                    $('#password-actual, #password-new, #password-new-confirm').val('');
                    return window.app.alerting(data['changePassword']);
                })
                .catch(err => {
                    window.app.alerting('Ocorreu um erro com o servidor. Tente novamente mais tarde!');

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
            <label class="fs-4 fw-bold" for="qrcode-usertoken">Insira o código que aparece em seu visor</label> \
            <input type="tel" class="form-control mb-2" id="qrcode-usertoken"> \
            <button type="button" class="btn btn-mave1 col-12" onclick="window.app.verifytwofactor()">Validar</button> \
        </div>\
        `);

        setTimeout(function () {
            $('.twofactor').animate({ opacity: 1 }, "slow");
        }, 1000);
    }

    async function signtwofactor() {
        window.app.loading(true);

        const { auth, token, internetadress } = await window.app.storage_get_userInfo();

        if (!auth && !token)
            return document.location = `${baseurl}/user/auth`;

        fetch(window.app.graphqlUrl, {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
                "authorization": "bu9Tix&1amuqihiXeHa*ajucRav6b5p7frOTRan6BLn!R27Wo*rlNA?Huf38riKo",
                "token": LZString.compressToEncodedURIComponent(token),
                "internetadress": LZString.compressToEncodedURIComponent(internetadress),
                "encodeuri": true
            },
            "body": `{\"query\":\"mutation { authSignTwofactor(usr_auth: \\\"${LZString.compressToEncodedURIComponent(auth)}\\\") }\"}`
        })
            .then(response => response.json())
            .then(({ data, errors }) => {
                window.app.loading(false);

                if (errors)
                    return errors.forEach(error => window.app.alerting(error.message));

                return showQRCode(data['authSignTwofactor']);
            })
            .catch(err => {
                window.app.alerting('Ocorreu um erro com o servidor. Tente novamente mais tarde!');

                throw new Error(err);
            });
    }

    async function verifytwofactor() {
        window.app.loading(true);

        const { auth, token, internetadress } = await window.app.storage_get_userInfo();

        if (!auth && !token)
            return document.location = `${baseurl}/user/auth`;

        const
            usr_auth = LZString.compressToEncodedURIComponent(auth),
            usr_qrcode = LZString.compressToEncodedURIComponent($('#qrcode-usertoken').val());

        fetch(window.app.graphqlUrl, {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
                "authorization": "duhoHU4o#3!oCHogLw*6WUbrE2radr2CrlpLD+P7Ka*R-veSEB75lsT6PeblPuko",
                "token": LZString.compressToEncodedURIComponent(token),
                "internetadress": LZString.compressToEncodedURIComponent(internetadress),
                "encodeuri": true
            },
            "body": `{\"query\":\"mutation { authVerifyTwofactor(usr_auth: \\\"${usr_auth}\\\", usr_qrcode: \\\"${usr_qrcode}\\\") }\"}`
        })
            .then(response => response.json())
            .then(({ data, errors }) => {
                window.app.loading(false);

                if (errors)
                    return errors.forEach(error => window.app.alerting(error.message));

                if (!data['authVerifyTwofactor']) {
                    window.app.alerting('O código informado está inválido. Tente novamente!');
                } else {
                    return enabledtwofactor();
                }
            })
            .catch(err => {
                window.app.alerting('Ocorreu um erro com o servidor. Tente novamente mais tarde!');

                throw new Error(err);
            });
    }

    async function enabledtwofactor() {
        window.app.loading(true);

        const { auth, token, internetadress } = await window.app.storage_get_userInfo();

        if (!auth && !token)
            return document.location = `${baseurl}/user/auth`;

        fetch(window.app.graphqlUrl, {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
                "authorization": "TH6021Mufr&0$B&?&-op&i-L-6p4ATH31h+?*m&dRACAc7e0Osw9$4E3oWRawE8h",
                "token": LZString.compressToEncodedURIComponent(token),
                "internetadress": LZString.compressToEncodedURIComponent(internetadress),
                "encodeuri": true
            },
            "body": `{\"query\":\"mutation { authEnabledTwofactor(usr_auth: \\\"${LZString.compressToEncodedURIComponent(auth)}\\\") }\"}`
        })
            .then(response => response.json())
            .then(({ data, errors }) => {
                window.app.loading(false);

                if (errors)
                    return errors.forEach(error => window.app.alerting(error.message));

                return window.app.alerting(`Sua autenticação de dois fatores, está ativada!`, 1000, function () { document.location.reload(); });
            })
            .catch(err => {
                window.app.alerting('Ocorreu um erro com o servidor. Tente novamente mais tarde!');

                throw new Error(err);
            });
    }

    async function disabledtwofactor() {
        window.app.loading(true);

        const { auth, token, internetadress } = await window.app.storage_get_userInfo();

        if (!auth && !token)
            return document.location = `${baseurl}/user/auth`;

        fetch(window.app.graphqlUrl, {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
                "authorization": "ciy16pAfawUfe5riwro1lth7barucOgavlprIbrlcrLVikekiPhapr*proDatrOr",
                "token": LZString.compressToEncodedURIComponent(token),
                "internetadress": LZString.compressToEncodedURIComponent(internetadress),
                "encodeuri": true
            },
            "body": `{\"query\":\"mutation { authDisableTwofactor(usr_auth: \\\"${LZString.compressToEncodedURIComponent(auth)}\\\") }\"}`
        })
            .then(response => response.json())
            .then(({ data, errors }) => {
                window.app.loading(false);

                if (errors)
                    return errors.forEach(error => window.app.alerting(error.message));

                return window.app.alerting(`Sua autenticação de dois fatores, está desativada!`, 1000, function () { document.location.reload(); });
            })
            .catch(err => {
                window.app.alerting('Ocorreu um erro com o servidor. Tente novamente mais tarde!');

                throw new Error(err);
            });
    }

    // ======================================================================
    // Events
    //
    document.getElementById('visibility-password-1').onclick = e => {
        let span = $(e.target).children().length > 0 ? $(e.target).children() : $(e.target);

        if (span.text() === 'visibility_off') {
            span.text('visibility');
            $('#password-actual').attr('type', 'text');
        } else {
            span.text('visibility_off');
            $('#password-actual').attr('type', 'password');
        }
    }

    document.getElementById('visibility-password-2').onclick = e => {
        let span = $(e.target).children().length > 0 ? $(e.target).children() : $(e.target);

        if (span.text() === 'visibility_off') {
            span.text('visibility');
            $('#password-new').attr('type', 'text');
        } else {
            span.text('visibility_off');
            $('#password-new').attr('type', 'password');
        }
    }

    document.getElementById('visibility-password-3').onclick = e => {
        let span = $(e.target).children().length > 0 ? $(e.target).children() : $(e.target);

        if (span.text() === 'visibility_off') {
            span.text('visibility');
            $('#password-new-confirm').attr('type', 'text');
        } else {
            span.text('visibility_off');
            $('#password-new-confirm').attr('type', 'password');
        }
    }

    // ======================================================================
    // Export to Globals(APP)
    //
    [
        { 'alias': 'signtwofactor', 'function': signtwofactor },
        { 'alias': 'verifytwofactor', 'function': verifytwofactor },
        { 'alias': 'disabledtwofactor', 'function': disabledtwofactor },
    ].forEach(prop => window.app[prop['alias']] = prop['function']);
})();