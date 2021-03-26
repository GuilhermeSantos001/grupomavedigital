(function () {
    "use strict";

    // ======================================================================
    // Import of Globals(APP)
    //
    window.app = window.app || {};

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

    document.getElementById(`input-address-socialmedia-Facebook`).addEventListener('change', e => socialmediaChange.call(this, 'Facebook', 'input', e));
    document.getElementById(`check-input-socialmedia-Facebook`).addEventListener('change', e => socialmediaChange.call(this, 'Facebook', 'check', e));

    document.getElementById(`input-address-socialmedia-Youtube`).addEventListener('change', e => socialmediaChange.call(this, 'Youtube', 'input', e));
    document.getElementById(`check-input-socialmedia-Youtube`).addEventListener('change', e => socialmediaChange.call(this, 'Youtube', 'check', e));

    document.getElementById(`input-address-socialmedia-Linkedin`).addEventListener('change', e => socialmediaChange.call(this, 'Linkedin', 'input', e));
    document.getElementById(`check-input-socialmedia-Linkedin`).addEventListener('change', e => socialmediaChange.call(this, 'Linkedin', 'check', e));

    document.getElementById(`input-address-socialmedia-Instagram`).addEventListener('change', e => socialmediaChange.call(this, 'Instagram', 'input', e));
    document.getElementById(`check-input-socialmedia-Instagram`).addEventListener('change', e => socialmediaChange.call(this, 'Instagram', 'check', e));

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

            window.app.fileUpload(input.files, 'assets/perfil', { type: 'temporary', index: `page-card-create-input-upload-photo-user`, origin: localStorage.getItem('usr-internetadress') })
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

            window.app.fileUpload(input.files, 'assets/Apresentação', { type: 'temporary', index: `page-card-create-input-upload-file-user`, origin: localStorage.getItem('usr-internetadress') })
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
            firstname = $('#input-vcard-prop-primeiro-nome').val(),
            lastname = $('#input-vcard-prop-último-nome').val(),
            organization = $('#input-vcard-prop-organização').val(),
            photo = window.app.cardGetPhoto(),
            logo = window.app.cardGetPhotoLogo(),
            workPhone = [$('#input-vcard-prop-telefone-de-trabalho').val(), $('#input-vcard-prop-telefone-de-trabalho-2').val()],
            birthday = {
                year: Number(document.getElementById('input-vcard-prop-data-de-aniversario').value.split('-')[0]),
                month: Number(document.getElementById('input-vcard-prop-data-de-aniversario').value.split('-')[1]) - 1,
                day: Number(document.getElementById('input-vcard-prop-data-de-aniversario').value.split('-')[2])
            },
            title = $('#input-vcard-prop-titulo').val(),
            url = $('#input-vcard-prop-website').val(),
            workUrl = 'https://grupomavedigital.com.br',
            email = $('#input-vcard-prop-email').val(),
            label = 'Work Address',
            countryRegion = 'Brazil',
            street = $('#input-vcard-prop-rua').val(),
            city = $('#input-vcard-prop-cidade').val(),
            stateProvince = $('#input-vcard-prop-estado').val(),
            postalCode = $('#input-vcard-prop-cep').val(),
            socialUrls = [
                {
                    media: "Youtube",
                    url: $('#input-address-socialmedia-Youtube').val()
                },
                {
                    media: "Linkedin",
                    url: $('#input-address-socialmedia-Linkedin').val()
                },
                {
                    media: "Instagram",
                    url: $('#input-address-socialmedia-Instagram').val()
                },
                {
                    media: "Facebook",
                    url: $('#input-address-socialmedia-Facebook').val()
                }
            ];

        if (
            firstname.length <= 0 ||
            lastname.length <= 0 ||
            organization.length <= 0 ||
            workPhone.length <= 0 ||
            title.length <= 0 ||
            url.length <= 0 ||
            workUrl.length <= 0 ||
            email.length <= 0 ||
            label.length <= 0 ||
            countryRegion.length <= 0 ||
            street.length <= 0 ||
            city.length <= 0 ||
            stateProvince.length <= 0 ||
            postalCode.length <= 0
        )
            return window.app.alerting('Está faltando dados para importar contato!');

        window.app.loading(true);
        window.app.vcardCreate(
            firstname,
            lastname,
            organization,
            photo,
            logo,
            workPhone,
            birthday,
            title,
            url,
            workUrl,
            email,
            label,
            countryRegion,
            street,
            city,
            stateProvince,
            postalCode,
            socialUrls
        )
            .then(({ filename }) => {
                window.app.loading(false);
                window.app.cardChangeVCF(filename);
                window.app.alerting('vCard definido com sucesso!');
            })
            .catch((err, details) => console.error(err, details))
    };

    document.getElementById('card-register').onclick = function () {
        if (window.app.cardGetVCF().length <= 0)
            return window.app.alerting('Gere o vCard primeiro!');

        const
            version = window.app.cardGetVersion(),
            photo = {
                path: window.app.cardGetPhoto()['path'],
                name: window.app.cardGetPhoto()['name']
            },
            name = $('#input-username').val(),
            jobtitle = $('#input-jobtitle').val(),
            phones = [
                $('#input-phone1').val(),
                $('#input-phone2').val()
            ],
            whatsapp = {
                phone: $('#input-phone3').val(),
                text: $('#input-phone3-text').val(),
                message: $('#input-share-whatsapp').val()
            },
            vcard = {
                firstname: $('#input-vcard-prop-primeiro-nome').val(),
                lastname: $('#input-vcard-prop-último-nome').val(),
                organization: $('#input-vcard-prop-organização').val(),
                photo: {
                    path: window.app.cardGetPhoto()['path'],
                    name: window.app.cardGetPhoto()['name']
                },
                logo: {
                    path: window.app.cardGetPhotoLogo()['path'],
                    name: window.app.cardGetPhotoLogo()['name']
                },
                workPhone: [
                    $('#input-vcard-prop-telefone-de-trabalho').val(),
                    $('#input-vcard-prop-telefone-de-trabalho-2').val()
                ],
                birthday: {
                    year: Number(document.getElementById('input-vcard-prop-data-de-aniversario').value.split('-')[0]),
                    month: Number(document.getElementById('input-vcard-prop-data-de-aniversario').value.split('-')[1]) - 1,
                    day: Number(document.getElementById('input-vcard-prop-data-de-aniversario').value.split('-')[2])
                },
                title: $('#input-vcard-prop-titulo').val(),
                url: $('#input-vcard-prop-website').val(),
                workUrl: 'https://grupomavedigital.com.br',
                email: $('#input-vcard-prop-email').val(),
                label: 'Work Address',
                street: $('#input-vcard-prop-rua').val(),
                city: $('#input-vcard-prop-cidade').val(),
                stateProvince: $('#input-vcard-prop-estado').val(),
                postalCode: $('#input-vcard-prop-cep').val(),
                countryRegion: 'Brazil',
                socialUrls: [
                    {
                        media: "Youtube",
                        url: $('#input-address-socialmedia-Youtube').val()
                    },
                    {
                        media: "Linkedin",
                        url: $('#input-address-socialmedia-Linkedin').val()
                    },
                    {
                        media: "Instagram",
                        url: $('#input-address-socialmedia-Instagram').val()
                    },
                    {
                        media: "Facebook",
                        url: $('#input-address-socialmedia-Facebook').val()
                    }
                ],
                file: {
                    path: 'vcf/',
                    name: window.app.cardGetVCF(),
                }
            },
            footer = {
                email: $('#input-email').val(),
                location: $('#input-localization').val(),
                website: $('#input-website').val(),
                attachment: window.app.cardGetFile(),
                socialmedia: [
                    {
                        name: 'Youtube',
                        value: $('#input-address-socialmedia-Youtube').val(),
                        enabled: Boolean($('#check-input-socialmedia-Youtube').is(':checked'))
                    },
                    {
                        name: 'Linkedin',
                        value: $('#input-address-socialmedia-Linkedin').val(),
                        enabled: Boolean($('#check-input-socialmedia-Linkedin').is(':checked'))
                    },
                    {
                        name: 'Instagram',
                        value: $('#input-address-socialmedia-Instagram').val(),
                        enabled: Boolean($('#check-input-socialmedia-Instagram').is(':checked'))
                    },
                    {
                        name: 'Facebook',
                        value: $('#input-address-socialmedia-Facebook').val(),
                        enabled: Boolean($('#check-input-socialmedia-Facebook').is(':checked'))
                    }
                ]
            };

        if (
            !version,
            !photo,
            !name,
            !jobtitle,
            !phones,
            !whatsapp,
            !vcard,
            !footer
        )
            return window.app.alerting('Está faltando dados para criar o cartão digital!');

        window.app.loading(true);
        window.app.cardCreate(
            version,
            photo,
            name,
            jobtitle,
            phones,
            whatsapp,
            vcard,
            footer
        )
            .then(({ url }) => {
                url = `${window.app.baseurl}/cards/card/${url}`;

                window.app.openModalSelect(
                    'Cartão Digital - Criado com sucesso',
                    [
                        '<h6 class="fw-bold">Você pode continuar na pagina ou visualizar seu cartão digital.</h6>',
                        `<p class="fw-bold text-muted">URL: ${url}</p>`,
                    ],
                    [
                        `<button type="button" class="btn btn-mave1" data-bs-dismiss="modal">Continuar</button>`,
                        `<button type="button" class="btn btn-mave2" data-bs-dismiss="modal" onclick="window.open('${url}', '_blank');">Visualizar</button>`
                    ]
                ).then(() => {
                    window.app.loading(false);
                }).catch(e => { throw new Error(e) });
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