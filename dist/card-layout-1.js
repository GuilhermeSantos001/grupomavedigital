(function () {
    "use strict";

    // ======================================================================
    // Import of Globals(APP)
    //
    window.app = window.app || {};

    // ======================================================================
    // Events
    //
    document.getElementById('button-share-whatsapp').onclick = function () {
        return window.app.cardShareWhatsapp();
    };

    // ======================================================================
    // Export to Globals(APP)
    //
    let
        phones = [
            ['11 3683-3408', '1136833408'],
            ['11 9999-9999', '1199999999'],
            ['11 94784-1110', '11947841110']
        ],
        whatsappText = 'Olá tudo bem? como representante comercial do Grupo Mave, estou aqui para ajudar no que for possível. Qual sua dúvida?',
        mail = 'ti@grupomave.com.br',
        gps = {
            'base': 'https://www.google.com.br/maps/place/',
            'value': 'R. Barão de Itaúna, 397 - Lapa, São Paulo - SP, 05078-080',
            'complete': function () { return this.base + this.value }
        },
        website = 'https://grupomave.com.br',
        socialmedia = {
            checked: function () {
                return Object.keys(this).forEach(media => $(`#socialmedia-${media}`).attr('disabled', !this[media].enabled));
            },
            'facebook': {
                'link': 'https://www.facebook.com/grupomaveoficial/',
                'enabled': true
            },
            'youtube': {
                'link': 'https://www.youtube.com/channel/UC5y4IOAlxQ4eictbudG785g',
                'enabled': true
            },
            'linkedin': {
                'link': 'https://www.linkedin.com/company/grupo-mave/?originalSubdomain=pt',
                'enabled': true
            },
            'instagram': {
                'link': 'https://www.instagram.com/grupo.mave/',
                'enabled': true
            }
        },
        filePath = '/assets/Apresentação/APRESENTACAO_MAVE.pdf',
        fileVCF = '',
        photoPerfil = { path: 'assets/perfil/', file: 'avatar.png' },
        whatsappAPI = {
            'base': `https://api.whatsapp.com/send?text=`,
            'text': 'Olá, este é o cartão de visita digital interativo do Grupo Mave. Tenha todas as informações a um clique. Acesse o link e saiba mais!',
            'link': 'https://grupomavedigital.com.br/cartaodigital/index'
        };

    socialmedia.checked();

    [
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
            'alias': 'cardOpenVCF', 'function': () => {
                if (fileVCF.length > 0)
                    return window.open(`/vcf/${fileVCF}`, '_blank');
                return window.app.alerting('Gere o vCard primeiro!');
            }
        },
        {
            'alias': 'cardChangeMail', 'function': (text) => {
                if (String(text).length > 0)
                    return mail = String(text);
            }
        },
        {
            'alias': 'cardOpenMail', 'function': () => {
                return window.open(`mailto:${mail}`, '_blank');
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
                photoPerfil = { path: 'assets/perfil/', file: photo };
                return document.getElementById('card-photo').src = `/assets/perfil/${photo}`;
            }
        },
        {
            'alias': 'cardGetPhoto', 'function': () => {
                return photoPerfil;
            }
        },
        {
            'alias': 'cardChangeFile', 'function': (file) => {
                return filePath = `/assets/Apresentação/${file}`
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
            'alias': 'cardShareChangeTextWhatsapp', 'function': (text) => {
                if (String(text).length > 0)
                    return whatsappAPI.text = String(text);
            }
        },
    ].forEach(prop => window.app[prop['alias']] = prop['function']);
})();