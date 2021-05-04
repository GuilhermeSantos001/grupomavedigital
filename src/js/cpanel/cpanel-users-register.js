
(function () {
    "use strict";

    // ======================================================================
    // Import of Globals(APP)
    //
    window.app = window.app || {};

    // ======================================================================
    // Masked Inputs
    //
    $("#input-zipcode").inputmask("99999-999", { "clearIncomplete": true });
    $("#input-cnpj").inputmask(['999.999.999-99', '99.999.999/9999-99'], { "clearIncomplete": true });
    $('#input-email').inputmask({
        mask: "*{1,20}[.*{1,20}][.*{1,20}][.*{1,20}]@*{1,20}[.*{2,6}][.*{1,2}]",
        greedy: false,
        onBeforePaste: function (pastedValue, opts) {
            pastedValue = pastedValue.toLowerCase();
            return pastedValue.replace("mailto:", "");
        },
        definitions: {
            '*': {
                validator: "[0-9A-Za-z!#$%&'*+/=?^_`{|}~\-]",
                casing: "lower"
            }
        }
    });

    // ======================================================================
    // Variables
    //
    let __user_photo = false,
        __user_username = (inputname = '#input-username') => $(inputname).val().length > 0 ? $(inputname).val() : false,
        __user_auth = (inputname = '#input-auth') => $(inputname).val().length > 0 ? $(inputname).val() : false,
        __user_name = (inputname = '#input-name') => $(inputname).val().length > 0 ? $(inputname).val() : false,
        __user_surname = (inputname = '#input-surname') => $(inputname).val().length > 0 ? $(inputname).val() : false,
        __user_email = (inputname = '#input-email') => $(inputname).val().length > 0 ? $(inputname).val() : false,
        __user_cnpj = (inputname = '#input-cnpj') => $(inputname).val().length > 0 ? $(inputname).inputmask('unmaskedvalue') : false,
        __user_street = (inputname = '#input-street') => $(inputname).val().length > 0 ? $(inputname).val() : false,
        __user_number = (inputname = '#input-number') => $(inputname).val().length > 0 ? Number($(inputname).val()) : false,
        __user_complement = (inputname = '#input-complement') => $(inputname).val().length > 0 ? $(inputname).val() : false,
        __user_district = (inputname = '#input-district') => $(inputname).val().length > 0 ? $(inputname).val() : false,
        __user_state = (inputname = '#input-state') => $(inputname).val().length > 0 ? $(inputname).val() : false,
        __user_city = (inputname = '#input-city') => $(inputname).val().length > 0 ? $(inputname).val() : false,
        __user_zipcode = (inputname = '#input-zipcode') => $(inputname).val().length > 0 ? $(inputname).inputmask('unmaskedvalue') : false,
        __user_privileges = () => {
            let privileges = [];

            if ($('#check-privilege-commum').prop("checked"))
                privileges.push('commum');

            if ($('#check-privilege-admin').prop("checked"))
                privileges.push('admin');

            if ($('#check-privilege-supervisor').prop("checked"))
                privileges.push('supervisor');

            if ($('#check-privilege-moderator').prop("checked"))
                privileges.push('moderator');

            return privileges;
        },
        __user_location = () => {
            return [
                __user_street(),
                __user_number(),
                __user_complement(),
                __user_district(),
                __user_state(),
                __user_city(),
                __user_zipcode()
            ]
        },
        __user_resetInputs = () => {
            [
                '#input-username',
                '#input-auth',
                '#input-name',
                '#input-surname',
                '#input-email',
                '#input-cnpj',
                '#input-street',
                '#input-number',
                '#input-complement',
                '#input-district',
                '#input-state',
                '#input-city',
                '#input-zipcode'
            ].forEach(inputname => $(inputname).val(''));
        },
        __system_create_account_enabled = false;

    // ======================================================================
    // Loops
    //
    setInterval(() => {
        if (
            __user_photo &&
            __user_username() &&
            __user_auth() &&
            __user_name() &&
            __user_surname() &&
            __user_email() &&
            __user_cnpj() &&
            __user_street() &&
            __user_number() &&
            __user_complement() &&
            __user_district() &&
            __user_state() &&
            __user_city() &&
            __user_zipcode()
        ) {
            $('#button-register-user').attr('disabled', false);
            __system_create_account_enabled = true;
        } else {
            $('#button-register-user').attr('disabled', true);
            __system_create_account_enabled = false;
        }
    }, window.app.ONE_SECOND_DELAY);

    // ======================================================================
    // Register User
    //
    async function registerUser() {
        if (__system_create_account_enabled) {
            window.app.loading(true);

            const { token, internetadress } = await window.app.storage_get_userInfo();

            fetch(window.app.graphqlUrl, {
                "method": "POST",
                "headers": {
                    "Content-Type": "application/json",
                    "authorization": "brufiT87+uchUfI9eFlPhificRi+OzawIwrIfriTH2Fr0ke0&fodrispl8Lc0IZo",
                    "token": LZString.compressToEncodedURIComponent(token),
                    "internetadress": LZString.compressToEncodedURIComponent(internetadress),
                    "encodeuri": true,
                    "temporarypass": true
                },
                "body": JSON.stringify({
                    query: `mutation { registerUser( \
                        authorization: \"${LZString.compressToEncodedURIComponent(__user_auth())}\" \
                        privilege: \"${LZString.compressToEncodedURIComponent(JSON.stringify(__user_privileges()))}\" \
                        fotoPerfil: \"${LZString.compressToEncodedURIComponent(__user_photo)}\" \
                        username: \"${LZString.compressToEncodedURIComponent(__user_username())}\" \
                        password: \"${LZString.compressToEncodedURIComponent('__create_password__')}\" \
                        name: \"${LZString.compressToEncodedURIComponent(__user_name())}\" \
                        surname: \"${LZString.compressToEncodedURIComponent(__user_surname())}\" \
                        email: \"${LZString.compressToEncodedURIComponent(__user_email())}\" \
                        cpfcnpj: \"${LZString.compressToEncodedURIComponent(__user_cnpj())}\" \
                        location: \"${LZString.compressToEncodedURIComponent(JSON.stringify(__user_location()))}\" \
                    ) }`
                })
            })
                .then(response => response.json())
                .then(({ data, errors }) => {
                    window.app.loading(false);

                    if (errors)
                        return errors.forEach(error => window.app.alerting(error.message));

                    const { registerUser } = data;

                    window.app.alerting(registerUser);

                    return __user_resetInputs();
                })
                .catch(err => {
                    window.app.alerting('Ocorreu um erro com o servidor. Tente novamente mais tarde!');

                    throw new Error(err);
                });
        }
    }

    // ======================================================================
    // Events
    //
    document.getElementById('input-photo').addEventListener('change', e => {
        if (e.target.files.length > 0)
            $('#button-upload-photo').attr('disabled', false);
        else
            $('#button-upload-photo').attr('disabled', true);
    });

    document.getElementById('button-upload-photo').onclick = async function () {
        let input = document.getElementById('input-photo');

        if (input && input.files.length > 0) {
            $('#input-photo, #button-upload-photo').attr('disabled', true);
            window.app.loading(true);

            const { internetadress } = await window.app.storage_get_userInfo();

            window.app.fileUpload(input.files, 'assets/perfil', { type: 'temporary', index: `page-cpanel-users-register-input-upload-photo-user`, origin: internetadress })
                .then(data => {
                    $('#input-photo')
                        .attr('disabled', false)
                        .val('');
                    $('#button-upload-photo').attr('disabled', true);
                    window.app.loading(false);

                    if (data['success']) {
                        __user_photo = data['data'];

                        document.getElementById('user-photo').src = `/assets/perfil/${__user_photo}`;

                        return window.app.alerting('Foto de Perfil definida com sucesso!');
                    } else {
                        return window.app.alerting('Ocorreu um erro no envio do arquivo, tente novamente mais tarde!');
                    }
                })
                .catch(e => console.error(e))
        }
    };

    // ======================================================================
    // Export to Globals(APP)
    //
    [
        { 'alias': 'registerUser', 'function': registerUser },
    ].forEach(prop => window.app[prop['alias']] = prop['function']);
})();