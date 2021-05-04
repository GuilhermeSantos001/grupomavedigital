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

    // ======================================================================
    // Export to Globals(APP)
    //
    [
        { 'alias': 'userInfoEdit', 'function': userInfoEdit },
    ].forEach(prop => window.app[prop['alias']] = prop['function']);
})();