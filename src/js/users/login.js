(function () {
    "use strict";

    // ======================================================================
    // Import of Globals(APP)
    //
    window.app = window.app || {};

    $(async () => {
        const { token, internetadress } = await window.app.storage_get_userInfo();

        if (token) {
            return document.location = `${window.app.baseurl}/system?usr_token=${token}&usr_internetadress=${internetadress}`;
        }
    })

    async function loginAuth(usr_twofactortoken) {
        window.app.loading(true);

        const { internetadress, locationIP } = await window.app.storage_get_userInfo();

        let
            usr_auth = String($('#input_authorization').val()),
            usr_pwd = String($('#input_password').val()),
            usr_locationIP = LZString.compressToEncodedURIComponent(String(locationIP)),
            usr_internetadress = LZString.compressToEncodedURIComponent(String(internetadress));

        if (usr_auth.length <= 0 || usr_pwd.length <= 0) {
            window.app.loading(false);

            if (!$('#input_authorization, #input_password').hasClass('is-invalid')) {
                $('#input_authorization, #input_password').addClass('is-invalid');
                let clear = setTimeout(function () {
                    $('#input_authorization, #input_password').removeClass('is-invalid');
                    clearTimeout(clear);
                }, window.app.DEFAULT_DELAY);
            }

            return window.app.alerting('Preencha os campos obrigatórios. Tente novamente!')
        }

        usr_auth = LZString.compressToEncodedURIComponent(String($('#input_authorization').val()));
        usr_pwd = LZString.compressToEncodedURIComponent(String($('#input_password').val()));

        fetch(window.app.graphqlUrl, {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
                "authorization": "SweteNlPut4uqlBiwIchiXafe1ld1bRICriBra7iPRazOs0ItRAtiwriyoyuyo-u",
                "internetadress": LZString.compressToEncodedURIComponent(internetadress),
                "encodeuri": true
            },
            "body": `{\"query\":\"{ user: authLogin(usr_auth: \\\"${usr_auth}\\\", pwd: \\\"${usr_pwd}\\\", twofactortoken: \\\"${LZString.compressToEncodedURIComponent(usr_twofactortoken)}\\\", locationIP: \\\"${usr_locationIP}\\\", internetAdress: \\\"${usr_internetadress}\\\") { authorization username name token } }\"}`
        })
            .then(response => response.json())
            .then(({ data, errors }) => {
                window.app.loading(false);

                if (errors)
                    return errors.forEach(error => window.app.alerting(error.message));

                const { user } = data || {};


                if (user['token'] === 'twofactorVerify')
                    return window.app.twofactor(loginAuth, usr_auth);
                else if (user['token'] === 'twofactorDenied')
                    return window.app.alerting('O código informado está inválido. Tente Novamente!')

                window.app.storage_set_userInfo({
                    auth: user['authorization'],
                    username: user['username'],
                    token: user['token'],
                    name: user['name']
                });

                return document.location = `${window.app.baseurl}/system?usr_token=${user['token']}&usr_internetadress=${internetadress}`;
            })
            .catch(err => {
                window.app.alerting('Ocorreu um erro com o servidor. Tente novamente mais tarde!');

                throw new Error(err);
            });
    }

    // ======================================================================
    // Events
    //
    document.getElementsByClassName('visibility-password')[0].onclick = e => {
        let span = $(e.target).children().length > 0 ? $(e.target).children() : $(e.target);

        if (span.text() === 'visibility_off') {
            span.text('visibility');
            $('#input_password').attr('type', 'text');
        } else {
            span.text('visibility_off');
            $('#input_password').attr('type', 'password');
        }
    }

    // ======================================================================
    // Export to Globals(APP)
    //
    [
        { 'alias': 'loginAuth', 'function': loginAuth },
    ].forEach(prop => window.app[prop['alias']] = prop['function']);
})();