(function () {
    "use strict";

    // ======================================================================
    // Import of Globals(APP)
    //
    window.app = window.app || {};

    // ======================================================================
    // Variables
    //
    let _edit = null,
        _email_change_alert = null;

    // ======================================================================
    // Masked Inputs
    //
    $("#input_cnpj").inputmask({
        mask: ['999.999.999-99', '99.999.999/9999-99'],
        keepStatic: true
    });

    $("#input_location_zipcode").inputmask({
        mask: ['99999-999'],
        keepStatic: true
    });

    // ======================================================================
    // Events
    //
    $('#input_email').on('mouseover', () => {
        if (_edit && !_email_change_alert) {
            _email_change_alert = true;

            return window.app.openModalSelect('Atenção!!!', [
                '<p>Verifique com atenção o email digitado, pois será necessário reativar sua conta após alterar o email.</p>'
            ], [
                '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Confirmar</button>',
            ]);
        }
    });

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

            window.app.fileUpload(input.files, 'assets/perfil', { type: 'temporary', index: `page-user-perfil-input-upload-photo-user`, origin: internetadress })
                .then(async data => {
                    $('#input-photo')
                        .attr('disabled', false)
                        .val('');
                    $('#button-upload-photo').attr('disabled', true);

                    window.app.loading(false);

                    if (data['success']) {
                        try {
                            document.getElementById('user-photo').src = `/assets/perfil/${data['files'][0]}`;

                            return window.app.alerting(await changeUserPhoto(data['files'][0]));
                        } catch (error) {
                            return window.app.alerting('Não foi possível confirmar a troca da sua foto, tente novamente mais tarde!');
                        }
                    } else {
                        return window.app.alerting('Ocorreu um erro no envio do arquivo, tente novamente mais tarde!');
                    }
                })
                .catch(e => console.error(e))
        }
    };

    // ======================================================================
    // Functions
    //
    function userInfoEdit() {
        if (!_edit) {
            $('#btn_userInfoEdit').html(`<i class="fas fa-save"></i> Salvar`);

            enableButtons();
        } else {
            $('#btn_userInfoEdit').html(`<i class="fas fa-user-edit"></i> Editar Informações`);

            syncUserData();
            disableButtons();
        }

        _edit = _edit ? false : true;
    };

    function enableButtons() {
        $(`
        #input_email,
        #input_username,
        #input_name,
        #input_surname,
        #input_cnpj,
        #input_location_street,
        #input_location_number,
        #input_location_complement,
        #input_location_district,
        #input_location_state,
        #input_location_city,
        #input_location_zipcode
        `).attr('disabled', false);
    };

    function disableButtons() {
        $(`
        #input_email,
        #input_username,
        #input_name,
        #input_surname,
        #input_cnpj,
        #input_location_street,
        #input_location_number,
        #input_location_complement,
        #input_location_district,
        #input_location_state,
        #input_location_city,
        #input_location_zipcode
        `).attr('disabled', true);
    };

    async function syncUserData() {
        window.app.loading(true);

        const { auth, token, internetadress } = await window.app.storage_get_userInfo();

        if (!auth && !token)
            return document.location = `${baseurl}/user/auth`;

        let
            usr_email = LZString.compressToEncodedURIComponent(String($('#input_email').val())),
            usr_username = LZString.compressToEncodedURIComponent(String($('#input_username').val())),
            usr_name = LZString.compressToEncodedURIComponent(String($('#input_name').val())),
            usr_surname = LZString.compressToEncodedURIComponent(String($('#input_surname').val())),
            usr_cnpj = LZString.compressToEncodedURIComponent(String($('#input_cnpj').inputmask('unmaskedvalue'))),
            usr_location = LZString.compressToEncodedURIComponent(JSON.stringify([
                String($('#input_location_street').val()),
                Number($('#input_location_number').val()),
                String($('#input_location_complement').val()),
                String($('#input_location_district').val()),
                String($('#input_location_state').val()),
                String($('#input_location_city').val()),
                String($('#input_location_zipcode').inputmask('unmaskedvalue'))
            ]));

        fetch(window.app.graphqlUrl, {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
                "authorization": "OGh!pb@lX*fnElqYo8%#VO63KihIr$F1nhf!a@SFOB7$VeQ0*R+s!Sd8wqewq4eq",
                "token": LZString.compressToEncodedURIComponent(token),
                "internetadress": LZString.compressToEncodedURIComponent(internetadress),
                "encodeuri": true
            },
            "body": `{\"query\":\"mutation { success: updateData(\
                usr_auth: \\\"${LZString.compressToEncodedURIComponent(auth)}\\\", \
                usr_email: \\\"${usr_email}\\\", \
                usr_username: \\\"${usr_username}\\\", \
                usr_name: \\\"${usr_name}\\\", \
                usr_surname: \\\"${usr_surname}\\\", \
                usr_cnpj: \\\"${usr_cnpj}\\\", \
                usr_location: \\\"${usr_location}\\\" \
                ) }\"}`
        })
            .then(response => response.json())
            .then(({ data, errors }) => {
                window.app.loading(false);

                if (errors)
                    return errors.forEach(error => window.app.alerting(error.message));

                const { success } = data || {};

                if (success) {
                    return window.app.alerting(`Suas informações foram atualizadas com sucesso!`, 1000);
                } else {
                    return window.app.alerting(`Não foi possível atualizar suas informações!`, 1000);
                }

            })
            .catch(err => {
                window.app.alerting('Ocorreu um erro com o servidor. Tente novamente mais tarde!');

                throw new Error(err);
            });
    }

    async function changeUserPhoto(photo) {
        return new Promise(async (resolve, reject) => {
            window.app.loading(true);

            const { auth, token, internetadress } = await window.app.storage_get_userInfo();

            if (!auth && !token)
                return document.location = `${baseurl}/user/auth`;

            let
                usr_photo = LZString.compressToEncodedURIComponent(String(photo));

            fetch(window.app.graphqlUrl, {
                "method": "POST",
                "headers": {
                    "Content-Type": "application/json",
                    "authorization": "GHbqjX-RMmbKMbCfGZBV*xF48Lzqg74vq8G6eM3KTekCdaV3JZ+MYDz=RyGeWJ8N",
                    "token": LZString.compressToEncodedURIComponent(token),
                    "internetadress": LZString.compressToEncodedURIComponent(internetadress),
                    "encodeuri": true
                },
                "body": `{\"query\":\"mutation { success: updatePhotoProfile(\
                    usr_auth: \\\"${LZString.compressToEncodedURIComponent(auth)}\\\", \
                    usr_photo: \\\"${usr_photo}\\\" \
                    ) }\"}`
            })
                .then(response => response.json())
                .then(({ data, errors }) => {
                    window.app.loading(false);

                    if (errors)
                        return errors.forEach(error => window.app.alerting(error.message));

                    const { success } = data || {};

                    if (success) {
                        return resolve(`Foto de Perfil definida com sucesso!`);
                    } else {
                        return reject(`Não foi possível atualizar suas informações!`);
                    }

                })
                .catch(err => {
                    reject('Ocorreu um erro com o servidor. Tente novamente mais tarde!');

                    throw new Error(err);
                });
        });
    }

    // ======================================================================
    // Export to Globals(APP)
    //
    [
        { 'alias': 'userInfoEdit', 'function': userInfoEdit },
    ].forEach(prop => window.app[prop['alias']] = prop['function']);
})();