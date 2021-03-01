(function () {
    "use strict";

    // ======================================================================
    // Import of Globals(APP)
    //
    window.app = window.app || {};

    // ======================================================================
    // Setters
    //
    document.getElementById('usr-name').innerText = localStorage.getItem("usr-name");

    // ======================================================================
    // Functions
    //
    function phoneChange(alias, e) {
        var input = e.target;

        if (input.inputmask)
            return window.app[alias]([$(input).val(), input.inputmask.unmaskedvalue()]);
    };

    function socialmediaChange(alias, type, e) {
        switch (type) {
            case 'check':
                return window.app.cardChangeSocialMedia(alias, {
                    'link': $(`#input-address-socialmedia-${alias}`).val(),
                    'enabled': $(e.target).is(':checked')
                });
            case 'input':
                return window.app.cardChangeSocialMedia(alias, {
                    'link': $(e.target).val(),
                    'enabled': $(`#check-input-socialmedia-${alias}`).is(':checked')
                });
        }
    };

    // ======================================================================
    // Masked Inputs
    //
    $("#input-phone1, #input-vcard-prop-telefone-de-trabalho").inputmask("(99) 9999-9999", { "clearIncomplete": true });
    $("#input-phone2, #input-phone3, #input-vcard-prop-telefone-de-trabalho-2").inputmask("(99) 99999-9999", { "clearIncomplete": true });
    $('#input-website, #input-vcard-prop-website').change(e => {
        if ($(e.target).val().slice(0, 5).indexOf('http') && $(e.target).val().slice(0, 5).indexOf('https') === -1)
            return $(e.target).val(`http://${$(e.target).val()}`);
    });
    $("#input-vcard-prop-cep").inputmask("99999-999", { "clearIncomplete": true });
    $('#input-email, #input-vcard-prop-email').inputmask({
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
    // Events
    //
    window.app.lockClosePage(); // Travando o fechamento da pagina

    document.getElementById('input-username').addEventListener('change', function (e) {
        return window.app.cardChangeName($(this).val());
    });

    document.getElementById('input-jobtitle').addEventListener('change', function (e) {
        return window.app.cardChangeJobtitle($(this).val());
    });

    document.getElementById('input-phone1').addEventListener('change', function (e) {
        return window.app.cardChangePhone1($(this).val());
    });

    document.getElementById('input-phone3-text').addEventListener('change', function (e) {
        return window.app.cardChangeTextWhatsapp($(this).val());
    });

    $('#input-phone1').change(e => phoneChange.call(this, 'cardChangePhone1', e));

    $('#input-phone2').change(e => phoneChange.call(this, 'cardChangePhone2', e));

    $('#input-phone3').change(e => phoneChange.call(this, 'cardChangePhone3', e));

    document.getElementById('input-email').addEventListener('change', function (e) {
        return window.app.cardChangeMail($(this).val());
    });

    document.getElementById('input-localization').addEventListener('change', function (e) {
        return window.app.cardChangeGPS($(this).val());
    });

    document.getElementById('input-website').addEventListener('change', function (e) {
        return window.app.cardChangeGPS($(this).val());
    });

    document.getElementById('input-share-whatsapp').addEventListener('change', function (e) {
        return window.app.cardShareChangeTextWhatsapp($(this).val());
    });

    document.getElementById(`input-address-socialmedia-facebook`).addEventListener('change', e => socialmediaChange.call(this, 'facebook', 'input', e));
    document.getElementById(`check-input-socialmedia-facebook`).addEventListener('change', e => socialmediaChange.call(this, 'facebook', 'check', e));

    document.getElementById(`input-address-socialmedia-youtube`).addEventListener('change', e => socialmediaChange.call(this, 'youtube', 'input', e));
    document.getElementById(`check-input-socialmedia-youtube`).addEventListener('change', e => socialmediaChange.call(this, 'youtube', 'check', e));

    document.getElementById(`input-address-socialmedia-linkedin`).addEventListener('change', e => socialmediaChange.call(this, 'linkedin', 'input', e));
    document.getElementById(`check-input-socialmedia-linkedin`).addEventListener('change', e => socialmediaChange.call(this, 'linkedin', 'check', e));

    document.getElementById(`input-address-socialmedia-instagram`).addEventListener('change', e => socialmediaChange.call(this, 'instagram', 'input', e));
    document.getElementById(`check-input-socialmedia-instagram`).addEventListener('change', e => socialmediaChange.call(this, 'instagram', 'check', e));

    document.getElementById('input-photo').addEventListener('change', e => {
        if (e.target.files.length > 0)
            $('#button-upload-photo').attr('disabled', false);
        else
            $('#button-upload-photo').attr('disabled', true);
    });

    document.getElementById('button-upload-photo').onclick = function () {
        let input = document.getElementById('input-photo');

        if (input && input.files.length > 0) {
            $('#input-photo, #button-upload-photo').attr('disabled', true);
            window.app.loading(true);

            window.app.fileUpload(input.files, 'assets/perfil')
                .then(data => {
                    $('#input-photo')
                        .attr('disabled', false)
                        .val('');
                    $('#button-upload-photo').attr('disabled', true);
                    window.app.loading(false);

                    if (data['success'])
                        return window.app.cardChangePhoto(data['data']), window.app.alerting('Foto de Perfil definida com sucesso!');
                    else
                        return window.app.alerting('Ocorreu um erro no envio do arquivo, tente novamente mais tarde!');
                })
                .catch(e => console.error(e))
        }
    };

    document.getElementById('input-file').addEventListener('change', e => {
        if (e.target.files.length > 0)
            $('#button-upload-file').attr('disabled', false);
        else
            $('#button-upload-file').attr('disabled', true);
    });

    document.getElementById('button-upload-file').onclick = function () {
        let input = document.getElementById('input-file');

        if (input && input.files.length > 0) {
            $('#input-file, #button-upload-file').attr('disabled', true);
            window.app.loading(true);

            window.app.fileUpload(input.files, 'assets/Apresentação')
                .then(data => {
                    $('#input-file')
                        .attr('disabled', false)
                        .val('');
                    $('#button-upload-file').attr('disabled', true);
                    window.app.loading(false);

                    if (data['success'])
                        return window.app.cardChangeFile(data['data']), window.app.alerting('Arquivo de Apresentação definido com sucesso!');
                    else
                        return window.app.alerting('Ocorreu um erro no envio do arquivo, tente novamente mais tarde!');
                })
                .catch(e => console.error(e))
        }
    };

    document.getElementById('vcard-generate').onclick = function () {
        const
            firstName = $('#input-vcard-prop-primeiro-nome').val(),
            lastName = $('#input-vcard-prop-último-nome').val(),
            organization = $('#input-vcard-prop-organização').val(),
            photo = window.app.cardGetPhoto(),
            logo = { path: 'assets/Logos/Grupo Mave/', file: 'logo_grupo_mave_faixa-cima.png' },
            workPhone = [$('#input-vcard-prop-telefone-de-trabalho').val(), $('#input-vcard-prop-telefone-de-trabalho-2').val()],
            birthday = {
                year: Number(document.getElementById('input-vcard-prop-data-de-aniversario').value.split('-')[0]),
                month: Number(document.getElementById('input-vcard-prop-data-de-aniversario').value.split('-')[1]) - 1,
                day: Number(document.getElementById('input-vcard-prop-data-de-aniversario').value.split('-')[2])
            },
            title = $('#input-vcard-prop-titulo').val(),
            url = $('#input-vcard-prop-website').val(),
            email = $('#input-vcard-prop-email').val(),
            street = $('#input-vcard-prop-rua').val(),
            city = $('#input-vcard-prop-cidade').val(),
            stateProvince = $('#input-vcard-prop-estado').val(),
            postalCode = $('#input-vcard-prop-cep').val(),
            socialUrls = {
                'youtube': $('#input-address-socialmedia-youtube').val(),
                'linkedin': $('#input-address-socialmedia-linkedin').val(),
                'instagram': $('#input-address-socialmedia-instagram').val(),
                'facebook': $('#input-address-socialmedia-facebook').val()
            };

        if (
            firstName.length <= 0 ||
            lastName.length <= 0 ||
            organization.length <= 0 ||
            workPhone.length <= 0 ||
            title.length <= 0 ||
            url.length <= 0 ||
            email.length <= 0 ||
            street.length <= 0 ||
            city.length <= 0 ||
            stateProvince.length <= 0 ||
            postalCode.length <= 0
        )
            return window.app.alerting('Está faltando dados para importar contato!');

        window.app.loading(true);
        window.app.vcardCreate(
            firstName,
            lastName,
            organization,
            photo,
            logo,
            workPhone,
            birthday,
            title,
            url,
            email,
            street,
            city,
            stateProvince,
            postalCode,
            socialUrls
        )
            .then(filename => {
                window.app.cardChangeVCF(filename);
                window.app.loading(false);
                window.app.alerting('vCard definido com sucesso!');
            })
            .catch((err, details) => console.error(err, details))
    };

    // ======================================================================
    // Export to Globals(APP)
    //
    // [
    //     { 'alias': '', 'function':  },
    // ].forEach(prop => window.app[prop['alias']] = prop['function']);
})();