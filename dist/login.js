(function () {
    "use strict";

    // ======================================================================
    // Import of Globals(APP)
    //
    window.app = window.app || {};

    $(document).ready(() => {
        if (localStorage.getItem('usr-token'))
            return document.location = `${window.app.baseurl}/system?usr_token=${localStorage.getItem('usr-token')}&usr_internetadress=${localStorage.getItem('usr-internetadress')}`;
    })

    function login(usr_twofactortoken = '') {
        window.app.loading(true);

        const
            usr_auth = LZString.compressToEncodedURIComponent(String($('#input_authorization').val())),
            usr_pwd = LZString.compressToEncodedURIComponent(String($('#input_password').val())),
            usr_locationIP = LZString.compressToEncodedURIComponent(String(localStorage.getItem('usr-locationIP'))),
            usr_internetadress = String(localStorage.getItem('usr-internetadress')); // Já está compressado

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

        fetch(window.app.graphqlUrl, {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
                "authorization": "SweteNlPut4uqlBiwIchiXafe1ld1bRICriBra7iPRazOs0ItRAtiwriyoyuyo-u"
            },
            "body": `{\"query\":\"{ user: authLogin(usr_auth: \\\"${usr_auth}\\\", pwd: \\\"${usr_pwd}\\\", locationIP: \\\"${usr_locationIP}\\\", internetAdress: \\\"${usr_internetadress}\\\") { authorization username name token } }\"}`
        })
            .then(response => response.json())
            .then(({ data, errors }) => {
                window.app.loading(false);

                if (errors)
                    return errors.forEach(error => window.app.alerting(error.message));

                const { user } = data || {};
                localStorage.setItem("usr-auth", user['authorization']);
                localStorage.setItem("usr-username", user['username']);
                localStorage.setItem("usr-token", user['token']);
                localStorage.setItem("usr-name", user['name']);

                return document.location = `${window.app.baseurl}/system?usr_token=${localStorage.getItem('usr-token')}&usr_internetadress=${localStorage.getItem('usr-internetadress')}`;
            })
            .catch(err => {
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
        { 'alias': 'login', 'function': login },
    ].forEach(prop => window.app[prop['alias']] = prop['function']);
})();