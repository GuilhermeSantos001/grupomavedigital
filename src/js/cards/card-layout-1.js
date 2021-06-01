(function () {
    "use strict";

    // ======================================================================
    // Import of Globals(APP)
    //
    window.app = window.app || {};

    // ======================================================================
    // Events
    //
    document.getElementById('card-share-whatsapp').onclick = function () {
        window.app.openModalSelect('Abra sua agenda ou Digite um numero com DDD', [
            '<b class="fs-6">O whatsapp tem um limite de 5 contatos selecionados para compartilhamento por vez.</b>',
            `
            <div class="input-group my-2">
                <span class="input-group-text" id="phone">+55</span>
                <input id="custom-whatsapp-phone" type="text" class="form-control" placeholder="Numero de Telefone(com DDD)" aria-label="phone" aria-describedby="phone">
            </div>
            `
        ], [
            '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal" id="button-share-whatsapp">Abrir Agenda</button>',
            '<button type="button" class="btn btn-primary" data-bs-dismiss="modal" id="button-share-whatsapp-with-phone">Enviar com numero</button>'
        ], true)
            .then(() => {
                document.getElementById('button-share-whatsapp').onclick = function () {
                    return window.app.cardShareWhatsapp();
                };

                document.getElementById('button-share-whatsapp-with-phone').onclick = function () {
                    return window.app.cardOpenWhatsappCustom($('#custom-whatsapp-phone').val());
                };
            })
            .catch(error => console.log(error));
    };

    // ======================================================================
    // Export to Globals(APP)
    //
    let
        version = window.app.cardGetProps['version'] || '1.0',
        phones = window.app.cardGetProps['phones'] || [
            ['11 3683-3408', '1136833408'],
            ['11 9999-9999', '1199999999'],
            ['11 94784-1110', '11947841110']
        ],
        whatsappText = window.app.cardGetProps['whatsapp_text'] || 'Olá tudo bem? como representante comercial do Grupo Mave, estou aqui para ajudar no que for possível. Qual sua dúvida?',
        email = window.app.cardGetProps['email'] || 'ti@grupomave.com.br',
        gps = {
            'base': 'https://www.google.com.br/maps/place/',
            'value': window.app.cardGetProps['location'] || 'R. Barão de Itaúna, 397 - Lapa, São Paulo - SP, 05078-080',
            'complete': function () { return this.base + this.value }
        },
        website = window.app.cardGetProps['website'] || 'https://grupomave.com.br',
        socialmedia = {
            checked: function () {
                return Object.keys(this).forEach(media => $(`#socialmedia-${media}`).attr('disabled', !this[media].enabled));
            },
            'Facebook': {
                'link': window.app.cardGetProps['socialmedia_facebook_link'] || 'https://www.facebook.com/grupomaveoficial/',
                'enabled': typeof window.app.cardGetProps['socialmedia_facebook_enabled'] === 'undefined' ? true : window.app.cardGetProps['socialmedia_facebook_enabled']
            },
            'Youtube': {
                'link': window.app.cardGetProps['socialmedia_youtube_link'] || 'https://www.youtube.com/channel/UC5y4IOAlxQ4eictbudG785g',
                'enabled': typeof window.app.cardGetProps['socialmedia_youtube_enabled'] === 'undefined' ? true : window.app.cardGetProps['socialmedia_youtube_enabled']
            },
            'Linkedin': {
                'link': window.app.cardGetProps['socialmedia_linkedin_link'] || 'https://www.linkedin.com/company/grupo-mave/?originalSubdomain=pt',
                'enabled': typeof window.app.cardGetProps['socialmedia_linkedin_enabled'] === 'undefined' ? true : window.app.cardGetProps['socialmedia_linkedin_enabled']
            },
            'Instagram': {
                'link': window.app.cardGetProps['socialmedia_instagram_link'] || 'https://www.instagram.com/grupo.mave/',
                'enabled': typeof window.app.cardGetProps['socialmedia_instagram_enabled'] === 'undefined' ? true : window.app.cardGetProps['socialmedia_instagram_enabled']
            }
        },
        filePath = window.app.cardGetProps['attachment'] || '/assets/Apresentação/APRESENTACAO_MAVE.pdf',
        fileVCF = window.app.cardGetProps['fileVCF'] || 'layout.vcf',
        photoPerfil = { path: window.app.cardGetProps['photoPath'] || 'assets/perfil/', name: window.app.cardGetProps['photoName'] || 'avatar.png' },
        photoLogo = { path: 'images/', name: 'favicon.png' },
        whatsappAPI = {
            'base': `https://api.whatsapp.com/send?text=`,
            'custom': phone => `https://api.whatsapp.com/send?phone=55${phone}&text=`,
            'text': window.app.cardGetProps['whatsapp_message'] || 'Olá, este é o cartão de visita digital interativo do Grupo Mave. Tenha todas as informações a um clique. Acesse o link e saiba mais!',
            'link': `${window.app.cardGetProps['baseurl']}/cards/card/${window.app.cardGetProps['id']}` || 'https://grupomavedigital.com.br/cartaodigital/index'
        };

    socialmedia.checked();

    [
        {
            'alias': 'cardGetVersion', 'function': () => {
                return version;
            }
        },
        {
            'alias': 'cardChangeName', 'function': (text) => {
                if (String(text).length > 0)
                    return document.getElementById('card-username').innerText = String(text);
            }
        },
        {
            'alias': 'cardChangeJobtitle', 'function': (text) => {
                if (String(text).length > 0)
                    return document.getElementById('card-jobtitle').innerText = String(text);
            }
        },
        {
            'alias': 'cardOpenPhone', 'function': (i) => {
                return window.open(`tel:${String(phones[i][1]).replace('-', '').toLowerCase()}`, '_blank');
            }
        },
        {
            'alias': 'cardOpenWhatsapp', 'function': (i) => {
                return window.open(`https://wa.me/55${phones[i][1]}?text=${whatsappText}`, '_blank');
            }
        },
        {
            'alias': 'cardChangeTextWhatsapp', 'function': (text) => {
                if (String(text).length > 0)
                    whatsappText = text;
            }
        },
        {
            'alias': 'cardChangePhone1', 'function': (text) => {
                phones[0] = [String(text[0]), String(text[1])];
                return document.getElementById('card-phone-1').innerHTML = `<i class="fas fa-phone"></i> ${String(text[0])}`;
            }
        },
        {
            'alias': 'cardChangePhone2', 'function': (text) => {
                phones[1] = [String(text[0]), String(text[1])];
                return document.getElementById('card-phone-2').innerHTML = `<i class="fas fa-mobile"></i> ${String(text[0])}`;
            }
        },
        {
            'alias': 'cardChangePhone3', 'function': (text) => {
                phones[2] = [String(text[0]), String(text[1])];
                return document.getElementById('card-phone-3').innerHTML = `<i class="fab fa-whatsapp"></i> ${String(text[0])}`;
            }
        },
        {
            'alias': 'cardChangeVCF', 'function': (text) => {
                if (String(text).length > 0)
                    return fileVCF = String(text);
            }
        },
        {
            'alias': 'cardGetVCF', 'function': () => {
                return fileVCF;
            }
        },
        {
            'alias': 'cardOpenVCF', 'function': () => {
                if (fileVCF.length > 0)
                    return window.open(`/vcf/${fileVCF}`, '_blank');
                return window.app.alerting('Gere o vCard primeiro!');
            }
        },
        {
            'alias': 'cardChangeMail', 'function': (text) => {
                if (String(text).length > 0)
                    return email = String(text);
            }
        },
        {
            'alias': 'cardOpenMail', 'function': () => {
                return window.open(`mailto:${email}`, '_blank');
            }
        },
        {
            'alias': 'cardChangeGPS', 'function': (text) => {
                if (String(text).length > 0)
                    return gps.value = String(text);
            }
        },
        {
            'alias': 'cardOpenGPS', 'function': () => {
                return window.open(`${gps.complete()}`, '_blank');
            }
        },
        {
            'alias': 'cardChangeWebsite', 'function': (text) => {
                if (String(text).length > 0)
                    return website = String(text);
            }
        },
        {
            'alias': 'cardOpenWebsite', 'function': () => {
                return window.open(`${website}`, '_blank');
            }
        },
        {
            'alias': 'cardChangeSocialMedia', 'function': (media, value) => {
                socialmedia[media] = value, socialmedia.checked();
            }
        },
        {
            'alias': 'cardOpenSocialMedia', 'function': (media) => {
                return window.open(`${socialmedia[media].link}`, '_blank');
            }
        },
        {
            'alias': 'cardChangePhoto', 'function': (photo) => {
                photoPerfil = { path: 'assets/perfil/', name: photo };
                return document.getElementById('card-photo').src = `/assets/perfil/${photo}`;
            }
        },
        {
            'alias': 'cardGetPhoto', 'function': () => {
                return photoPerfil;
            }
        },
        {
            'alias': 'cardGetPhotoLogo', 'function': () => {
                return photoLogo;
            }
        },
        {
            'alias': 'cardChangeFile', 'function': (file) => {
                return filePath = `/assets/Apresentação/${file}`
            }
        },
        {
            'alias': 'cardGetFile', 'function': () => {
                return filePath;
            }
        },
        {
            'alias': 'cardOpenFile', 'function': () => {
                return window.open(`${filePath}`, '_blank');
            }
        },
        {
            'alias': 'cardShareWhatsapp', 'function': () => {
                return window.open(`${whatsappAPI.base}${whatsappAPI.text} ${whatsappAPI.link}`, '_blank');
            }
        },
        {
            'alias': 'cardOpenWhatsappCustom', 'function': (phone) => {
                if (phone.length <= 0)
                    return window.app.alerting('Digite um numero de telefone com DDD');

                return window.open(`${whatsappAPI.custom(phone)}${whatsappAPI.text} ${whatsappAPI.link}`, '_blank');
            }
        },
        {
            'alias': 'cardShareChangeTextWhatsapp', 'function': (text) => {
                if (String(text).length > 0)
                    return whatsappAPI.text = String(text);
            }
        },
        {
            'alias': 'cardShareChangeLinkWhatsapp', 'function': (link) => {
                if (String(link).length > 0)
                    return whatsappAPI.link = String(link);
            }
        },
    ].forEach(prop => window.app[prop['alias']] = prop['function']);
})();