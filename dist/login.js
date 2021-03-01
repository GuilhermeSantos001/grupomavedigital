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

    let loginTimeout = {
        exe: () => {
            $('#input_authorization, #input_password').removeClass('is-invalid');
            $('#passwordHelp').text('');
        },
        timeout: null,
        verify: () => {
            if (loginTimeout.timeout) {
                clearTimeout(loginTimeout.timeout);
                loginTimeout.exe();
                loginTimeout.timeout = null;
            }
        },
        define: () => {
            loginTimeout.timeout = setTimeout(loginTimeout.exe, 1000);
        }
    }

    function login(usr_twofactortoken = '') {
        window.app.loading(true);
        loginTimeout.verify();

        axios.request({
            method: 'POST',
            url: `${window.app.baseurl}/user/auth/login`,
            headers: {
                "Content-Type": "application/json"
            },
            data: {
                'usr_authorization': LZString.compressToEncodedURIComponent($('#input_authorization').val()),
                'password': LZString.compressToEncodedURIComponent($('#input_password').val()),
                'usr_twofactortoken': LZString.compressToEncodedURIComponent(usr_twofactortoken),
                'locationIP': LZString.compressToEncodedURIComponent(localStorage.getItem('usr-locationIP')),
                'internetAdress': localStorage.getItem('usr-internetadress')
            }
        })
            .then(response => {
                console.log(response);

                let { data } = response['data'];

                if (data === 'exceeded') {
                    window.app.alerting('Você excedeu o limite de sessões');
                    return window.app.loading(false);
                } else if (data === 'deviceblocked') {
                    window.app.alerting('Esse dispositivo não está habilitado a se conectar');
                    return window.app.loading(false);
                } else if (data === 'twofactorVerify') {
                    window.app.twofactor(login, $('#input_authorization').val());
                    return loading(false);
                } else if (data === 'twofactorDenied') {
                    window.app.alerting('Seu código não está correto, tente novamente.');
                    return window.app.loading(false);
                }

                if (data && data['user']) {
                    localStorage.setItem("usr-auth", data['user']['authorization']);
                    localStorage.setItem("usr-username", data['user']['username']);
                    localStorage.setItem("usr-token", data['user']['token']);
                    localStorage.setItem("usr-name", data['user']['name']);
                    document.location = `${window.app.baseurl}/system?usr_token=${localStorage.getItem('usr-token')}&usr_internetadress=${localStorage.getItem('usr-internetadress')}`;
                    window.app.loading(false);
                } else {
                    window.app.loading(false);
                    $('#input_authorization, #input_password').addClass('is-invalid');
                    if (jsondata && jsondata['error'][1] === '401 - By email not verify')
                        $('#passwordHelp').text('Você precisa confirmar o seu endereço de email. Verifique sua caixa de entrada!');
                    else
                        $('#passwordHelp').text('Autorização ou Senha está incorreto.');
                    loginTimeout.define();
                }
            })
            .catch(err => {
                console.error(err);
                window.app.loading(false);
                $('#passwordHelp').text('Ocorreu um erro com o servidor. Tente novamente mais tarde!');
            })
    }

    // ======================================================================
    // Export to Globals(APP)
    //     
    [
        { 'alias': 'login', 'function': login },
    ].forEach(prop => window.app[prop['alias']] = prop['function']);
})();