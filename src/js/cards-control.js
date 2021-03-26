(function () {
    "use strict";

    // ======================================================================
    // Import of Globals(APP)
    //
    window.app = window.app || {};

    // ======================================================================
    // Variables
    //
    let
        photoLogo = { path: 'images/', name: 'favicon.png' },
        photoPerfil = { path: 'assets/perfil/', name: 'avatar.png' },
        filePresentation = '/assets/Apresentação/APRESENTACAO_MAVE.pdf',
        limit = Number(sessionStorage.getItem('card-control-items-limit')) || 10;

    // ======================================================================
    // Setters
    //
    $('#input-limit').val(limit);

    // ======================================================================
    // Events
    //
    window.app.filter_input("input-search", "list-cards", "a", ["h5", "p"]);
    defineEventsItems();

    $('#input-limit').on('change', function () {
        limit = Number($(this).val());

        if (limit <= 0) {
            limit = 1;
            $('#input-limit').val(limit);
        } else if (limit > 100) {
            limit = 100;
            $('#input-limit').val(limit);
        }

        return sessionStorage.setItem('card-control-items-limit', limit);
    });

    let getcards, fetchCards;
    $(window).on('scroll', function () {
        if ($(window).scrollTop() + $(window).height() >= $(document).height() - 100) {
            if (fetchCards || getcards) return;

            let items = $('#list-cards').children(),
                lastIndex = items.get(items.length - 1);

            const cards = window.app.cardsCompressData.filter(card => {
                if (String(lastIndex.id).replace('container-card-', '') === card['id'])
                    return true;
            });

            if (cards.length > 0) {
                $('#list-cards').append(`
                <div class="list-group-item list-group-item-action col-12" id="loading-more-items">
                    <div class="d-flex justify-content-between">
                        <button class="btn btn-mave1 col-12" type="button" disabled>
                            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            Loading...
                        </button>
                    </div>
                </div>
                `)

                getcards = setTimeout(function () {
                    fetchCards = new Promise((resolve, reject) => {
                        fetch(window.app.graphqlUrl, {
                            "method": "POST",
                            "headers": {
                                "Content-Type": "application/json",
                                "authorization": "cnR{rrCHWtcB{/9tx^nG<sM6Km]Mc_RcE$-?.3}g;_N<T(]Grw97.jczDR?>gy&]"
                            },
                            "body": JSON.stringify({
                                query: `query { cards: cardGet(lastIndex: \"${cards[0]['_index']}\", limit: ${Number(limit)}) }`
                            })
                        })
                            .then(response => response.json())
                            .then(({ data, errors }) => {
                                window.app.loading(false);

                                if (errors)
                                    return errors.forEach(error => window.app.alerting(error.message));

                                resolve(data);
                            })
                            .catch(err => reject(err));
                    });

                    fetchCards
                        .then(({ cards }) => JSON.parse(LZString.decompressFromEncodedURIComponent(cards)))
                        .then(data => {
                            $('#loading-more-items').fadeOut('fast', function () {
                                this.remove();
                            });

                            if (data.length > 0) {
                                data.map(card => {
                                    let
                                        id = card['id'],
                                        photo = card['photo'],
                                        url = `${window.app.baseurl}/cards/card/${id}`,
                                        name = card['name'],
                                        jobtitle = card['jobtitle'],
                                        version = card['version'];

                                    if (window.app.cardItems.filter(__card => __card['id'] === id && window.app.cardsCompressData.filter(__card => __card['id'] === id).length <= 0)) {
                                        $('#list-cards').append(`
                                            <a class="list-group-item list-group-item-action col-12" aria-current="true" id='container-card-${id}'>
                                                <div class="d-flex flex-lg-row flex-sm-column justify-content-between">
                                                    <div class="col-sm-12 col-lg-1 border-end">
                                                        <img id='card-photo-${id}' src='/${photo['path']}${photo['name']}' class="rounded-circle mx-auto mt-2 d-block shadow" width="80" height="80">
                                                        <button type="button" class="btn btn-mave2 col-12 mt-2 btn-sm" id='card-view-id-${id}'>
                                                            Visualizar
                                                        </button>
                                                    </div>
                                                    <div class="d-flex flex-column col-sm-12 col-lg p-2 text-lg-start text-sm-center">
                                                        <h5 class="mb-1" id='card-name-${id}'>${name}</h5>
                                                        <p class="mb-1" id='card-jobtitle-${id}'>${jobtitle}</p>
                                                        <div class="d-flex flex-row col-12 justify-content-start">
                                                            <button type="button" class="btn btn-mave1 col-sm-6 col-lg-4 me-2 btn-sm" id='card-edit-${id}'>
                                                                Editar
                                                            </button>
                                                            <button type="button" class="btn btn-mave1 col-sm-6 col-lg-4 btn-sm" id='card-remove-${id}'>
                                                                Remover
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <small class="text-sm-center">Layout: ${version}</small>
                                                </div>
                                            </a>
                                            `)

                                        document.getElementById(`card-view-id-${id}`).onclick = () => {
                                            return window.open(url, '_blank');
                                        }

                                        window.app.cardItems.push(id);
                                        window.app.cardsCompressData.push(card);
                                    }
                                })

                                defineEventsItems();
                                fetchCards = setTimeout(() => {
                                    clearTimeout(getcards), getcards = null;
                                    clearTimeout(fetchCards), fetchCards = null;
                                }, 1000);
                            } else {
                                fetchCards = 'no more data...';
                            }
                        })
                        .catch(error => { throw new Error(error) });
                }, 1000);
            }
        }
    });

    function defineEventsItems() {
        window.app.cardItems.forEach(id => {
            if (document.getElementById(`card-edit-${id}`))
                document.getElementById(`card-edit-${id}`).onclick = async function (e) {
                    const cards = await window.app.cardsCompressData.map((card, i) => {
                        if (card['id'] === id) {
                            return { card, indexOf: i }
                        }
                        return null;
                    });

                    if (cards.filter(card => card != null).length <= 0) return window.app.alerting('Não é possível editar o cartão digital. Tente novamente mais tarde!');

                    const { card, indexOf } = cards.filter(card => card != null)[0];

                    const birthday = (() => {
                        let month = ((value) => {
                            return String(value + 1 < 10 ? '0' + (value + 1) : value + 1)
                        })(card['vcard']['birthday']['month']);

                        return `${card['vcard']['birthday']['year']}-${month}-${card['vcard']['birthday']['day']}`;
                    })();

                    photoPerfil = { path: card['photo']['path'], name: card['photo']['name'] };

                    window.app.openModalSelect(title = `Editar Cartão Digital - ${card['name']}(${card['jobtitle']})`, contentHTML = [
                        `\
                        <div class="d-flex justify-content-center my-2 col-12">
                            <img src='/${photoPerfil['path']}${photoPerfil['name']}' class="rounded-circle align-self-center shadow" id="card-photo" width="140" height="140">
                        </div>
                        <div class="d-flex flex-column my-1 col-12 border-start border-end border-bottom">
                            <h4 class="text-center" id="card-username">${card['name']}</h4>
                            <h4 class="text-center" id="card-jobtitle">${card['jobtitle']}</h4>
                        </div>
                        <div class="accordion mt-3" id="accordionExample">
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="headingOne">
                                    <button class="accordion-button text-mave1 fw-bold collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
                                        Redes Sociais <span class="badge bg-mave1 rounded-pill ms-2">Habilitar/Desabilitar</span>
                                    </button>
                                </h2>
                                <div id="collapseOne" class="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                                    <div class="accordion-body">
                                        <div class="form-check col-12 mx-auto py-2">
                                            <input class="form-check-input" type="checkbox" value="" id='check-input-socialmedia-${card['footer']['socialmedia'][0]['name']}' ${card['footer']['socialmedia'][0]['enabled'] ? 'checked' : ''}>
                                            <label class="form-check-label" for='check-input-socialmedia-${card['footer']['socialmedia'][0]['name']}'>
                                                <i class='fab fa-${card['footer']['socialmedia'][0]['name'].toLowerCase()}'></i> ${card['footer']['socialmedia'][0]['name']}
                                            </label>
                                        </div>
                                        <div class="form-check col-12 mx-auto py-2">
                                            <input class="form-check-input" type="checkbox" value="" id='check-input-socialmedia-${card['footer']['socialmedia'][1]['name']}' ${card['footer']['socialmedia'][1]['enabled'] ? 'checked' : ''}>
                                            <label class="form-check-label" for='check-input-socialmedia-${card['footer']['socialmedia'][1]['name']}'>
                                                <i class='fab fa-${card['footer']['socialmedia'][1]['name'].toLowerCase()}'></i> ${card['footer']['socialmedia'][1]['name']}
                                            </label>
                                        </div>
                                        <div class="form-check col-12 mx-auto py-2">
                                            <input class="form-check-input" type="checkbox" value="" id='check-input-socialmedia-${card['footer']['socialmedia'][2]['name']}' ${card['footer']['socialmedia'][2]['enabled'] ? 'checked' : ''}>
                                            <label class="form-check-label" for='check-input-socialmedia-${card['footer']['socialmedia'][2]['name']}'>
                                                <i class='fab fa-${card['footer']['socialmedia'][2]['name'].toLowerCase()}'></i> ${card['footer']['socialmedia'][2]['name']}
                                            </label>
                                        </div>
                                        <div class="form-check col-12 mx-auto py-2">
                                            <input class="form-check-input" type="checkbox" value="" id='check-input-socialmedia-${card['footer']['socialmedia'][3]['name']}' ${card['footer']['socialmedia'][3]['enabled'] ? 'checked' : ''}>
                                            <label class="form-check-label" for='check-input-socialmedia-${card['footer']['socialmedia'][3]['name']}'>
                                                <i class='fab fa-${card['footer']['socialmedia'][3]['name'].toLowerCase()}'></i> ${card['footer']['socialmedia'][3]['name']}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="headingTwo">
                                    <button class="accordion-button text-mave1 fw-bold collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                                    Redes Sociais <span class="badge bg-mave1 rounded-pill ms-2">Domínios</span>
                                    </button>
                                </h2>
                                <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
                                    <div class="accordion-body">
                                        <div class="form-floating col-12 mx-auto py-2">
                                            <input type="text" class="form-control" id='input-address-socialmedia-${card['footer']['socialmedia'][0]['name']}' placeholder="https://www.youtube.com/channel/UC5y4IOAlxQ4eictbudG785g" value='${card['footer']['socialmedia'][0]['value']}'>
                                            <label for='input-address-socialmedia-${card['footer']['socialmedia'][0]['name']}'>${card['footer']['socialmedia'][0]['name']}</label>
                                        </div>
                                        <div class="form-floating col-12 mx-auto py-2">
                                            <input type="text" class="form-control" id='input-address-socialmedia-${card['footer']['socialmedia'][1]['name']}' placeholder="https://www.linkedin.com/company/grupo-mave/?originalSubdomain=pt" value='${card['footer']['socialmedia'][1]['value']}'>
                                            <label for='input-address-socialmedia-${card['footer']['socialmedia'][1]['name']}'>${card['footer']['socialmedia'][1]['name']}</label>
                                        </div>
                                        <div class="form-floating col-12 mx-auto py-2">
                                            <input type="text" class="form-control" id='input-address-socialmedia-${card['footer']['socialmedia'][2]['name']}' placeholder="https://www.instagram.com/grupo.mave/" value='${card['footer']['socialmedia'][2]['value']}'>
                                            <label for='input-address-socialmedia-${card['footer']['socialmedia'][2]['name']}'>${card['footer']['socialmedia'][2]['name']}</label>
                                        </div>
                                        <div class="form-floating col-12 mx-auto py-2">
                                            <input type="text" class="form-control" id='input-address-socialmedia-${card['footer']['socialmedia'][3]['name']}' placeholder="https://www.facebook.com/grupomaveoficial/" value='${card['footer']['socialmedia'][3]['value']}'>
                                            <label for='input-address-socialmedia-${card['footer']['socialmedia'][3]['name']}'>${card['footer']['socialmedia'][3]['name']}</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="headingThree">
                                    <button class="accordion-button text-mave1 fw-bold collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                                        Dados para importar contato <span class="badge bg-mave1 rounded-pill ms-2">vCard</span>
                                    </button>
                                </h2>
                                <div id="collapseThree" class="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#accordionExample">
                                    <div class="accordion-body">
                                        <div class="form-floating col-12 mx-auto py-2">
                                            <input type="text" class="form-control" id='input-vcard-prop-primeiro-nome' placeholder='Primeiro Nome' value='${card['vcard']['firstname']}'>
                                            <label for='input-vcard-prop-primeiro-nome'>Primeiro Nome</label>
                                        </div>
                                        <div class="form-floating col-12 mx-auto py-2">
                                            <input type="text" class="form-control" id='input-vcard-prop-último-nome' placeholder='Último Nome' value='${card['vcard']['lastname']}'>
                                            <label for='input-vcard-prop-último-nome'>Último Nome</label>
                                        </div>
                                        <div class="form-floating col-12 mx-auto py-2">
                                            <input type="text" class="form-control" id='input-vcard-prop-organização' placeholder='Organização' value='${card['vcard']['organization']}'>
                                            <label for='input-vcard-prop-organização'>Organização</label>
                                        </div>
                                        <div class="form-floating col-12 mx-auto py-2">
                                            <input type="text" class="form-control" id='input-vcard-prop-telefone-de-trabalho' placeholder='Telefone de Trabalho' value='${card['vcard']['workPhone'][0]}'>
                                            <label for='input-vcard-prop-telefone-de-trabalho'>Telefone de Trabalho</label>
                                        </div>
                                        <div class="form-floating col-12 mx-auto py-2">
                                            <input type="text" class="form-control" id='input-vcard-prop-telefone-de-trabalho-2' placeholder='Telefone de Trabalho 2' value='${card['vcard']['workPhone'][1]}'>
                                            <label for='input-vcard-prop-telefone-de-trabalho-2'>Telefone de Trabalho 2</label>
                                        </div>
                                        <div class="form-floating col-12 mx-auto py-2">
                                            <input type="date" class="form-control" id='input-vcard-prop-data-de-aniversario' placeholder='Data de Aniversario' value='${birthday}'>
                                            <label for='input-vcard-prop-data-de-aniversario'>Data de Aniversario</label>
                                        </div>
                                        <div class="form-floating col-12 mx-auto py-2">
                                            <input type="text" class="form-control" id='input-vcard-prop-titulo' placeholder='Titulo' value='${card['vcard']['title']}'>
                                            <label for='input-vcard-prop-titulo'>Titulo</label>
                                        </div>
                                        <div class="form-floating col-12 mx-auto py-2">
                                            <input type="text" class="form-control" id='input-vcard-prop-website' placeholder='Website' value='${card['vcard']['url']}'>
                                            <label for='input-vcard-prop-website'>Website</label>
                                        </div>
                                        <div class="form-floating col-12 mx-auto py-2">
                                            <input type="text" class="form-control" id='input-vcard-prop-email' placeholder='Email' value='${card['vcard']['email']}'>
                                            <label for='input-vcard-prop-email'>Email</label>
                                        </div>
                                        <div class="form-floating col-12 mx-auto py-2">
                                            <input type="text" class="form-control" id='input-vcard-prop-rua' placeholder='Rua' value='${card['vcard']['street']}'>
                                            <label for='input-vcard-prop-rua'>Rua</label>
                                        </div>
                                        <div class="form-floating col-12 mx-auto py-2">
                                            <input type="text" class="form-control" id='input-vcard-prop-cidade' placeholder='Cidade' value='${card['vcard']['city']}'>
                                            <label for='input-vcard-prop-cidade'>Cidade</label>
                                        </div>
                                        <div class="form-floating col-12 mx-auto py-2">
                                            <input type="text" class="form-control" id='input-vcard-prop-estado' placeholder='Estado' value='${card['vcard']['stateProvince']}'>
                                            <label for='input-vcard-prop-estado'>Estado</label>
                                        </div>
                                        <div class="form-floating col-12 mx-auto py-2">
                                            <input type="text" class="form-control" id='input-vcard-prop-cep' placeholder='CEP' value='${card['vcard']['postalCode']}'>
                                            <label for='input-vcard-prop-cep'>CEP</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="heading_4">
                                    <button class="accordion-button text-mave1 fw-bold collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse_4" aria-expanded="false" aria-controls="collapse_4">
                                        Compartilhar no Whatsapp <span class="badge bg-mave1 rounded-pill ms-2">Texto</span>
                                    </button>
                                </h2>
                                <div id="collapse_4" class="accordion-collapse collapse" aria-labelledby="heading_4" data-bs-parent="#accordionExample">
                                    <div class="accordion-body">
                                        <div class="d-flex flex-wrap p-lg-2 p-xl-2 p-xxl-2 col-12">
                                            <div class="form-floating col-12 mx-auto py-2">
                                                <span class="input-group-text" id="span-share-whatsapp">
                                                    <i class="fas fa-quote-right"></i>
                                                    <textarea class="form-control col-6 p-2" id="input-share-whatsapp" style="height: 250px" placeholder="Texto a ser compartilhar" aria-label="span-share-whatsapp" aria-describedby="span-share-whatsapp">${card['whatsapp']['message']}</textarea>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="input-group flex-nowrap my-3">
                            <div class="col-12">
                                <label for="input-photo" class="form-label fw-bold text-mave1 fs-5">
                                    Escolher Foto de Perfil
                                </label>
                                <input class="form-control" type="file" id="input-photo" accept="image/x-png,image/gif,image/jpeg">
                            </div>
                        </div>
                        <div class="input-group flex-nowrap my-3">
                            <button type="button" class="btn btn-mave1 btn-sm col-12 fs-6" id="button-upload-photo" disabled>
                                <i class="fas fa-cloud-upload-alt"></i> Enviar Foto de Perfil
                            </button>
                        </div>
                        <div class="input-group flex-nowrap my-3">
                            <div class="col-12">
                                <label for="input-file" class="form-label fw-bold text-mave1 fs-5">
                                    Escolher Arquivo de Apresentação
                                </label>
                                <input class="form-control" type="file" id="input-file" accept="application/pdf">
                            </div>
                        </div>
                        <div class="input-group flex-nowrap mt-3">
                            <button type="button" class="btn btn-mave2 btn-sm col-12 fs-6" id="button-open-file">
                                <i class="fas fa-external-link-square-alt"></i> Visualizar
                            </button>
                        </div>
                        <div class="input-group flex-nowrap mt-2">
                            <button type="button" class="btn btn-mave1 btn-sm col-12 fs-6" id="button-upload-file" disabled>
                                <i class="fas fa-cloud-upload-alt"></i> Enviar Arquivo de Apresentação
                            </button>
                        </div>
                        <div class="input-group flex-nowrap my-3">
                            <span class="input-group-text" id="span-username">
                                <i class="fas fa-user-circle"></i>
                            </span>
                            <input type="text" class="form-control col-6" id="input-username" placeholder="Nome do Colaborador" aria-label="span-username" aria-describedby="span-username" value="${card['name']}">
                            <span class="input-group-text" id="span-jobtitle">
                                <i class="far fa-address-card"></i>
                            </span>
                            <input type="text" class="form-control col-6" id="input-jobtitle" placeholder="Cargo/Função" aria-label="span-jobtitle" aria-describedby="span-jobtitle" value="${card['jobtitle']}">
                        </div>
                        <div class="input-group flex-nowrap my-3">
                            <span class="input-group-text" id="span-phone1">
                                <i class="fas fa-phone"></i>
                            </span>
                            <input type="text" class="form-control col-6" id="input-phone1" placeholder="Telefone" aria-label="span-phone1" aria-describedby="span-phone1" value="${card['phones'][0]}">
                            <span class="input-group-text" id="span-phone2">
                                <i class="fas fa-mobile"></i>
                            </span>
                            <input type="text" class="form-control col-6" id="input-phone2" placeholder="Celular" aria-label="span-phone2" aria-describedby="span-phone2" value="${card['phones'][1]}">
                        </div>
                        <div class="input-group flex-nowrap my-3">
                            <span class="input-group-text" id="span-phone3">
                                <i class="fab fa-whatsapp"></i>
                            </span>
                            <input type="text" class="form-control" id="input-phone3" placeholder="Whatsapp" aria-label="span-phone3" aria-describedby="span-phone3" value="${card['whatsapp']['phone']}">
                        </div>
                        <div class="input-group flex-nowrap my-3">
                            <span class="input-group-text" id="span-phone3-text">
                                <i class="far fa-comment-dots"></i>
                            </span>
                            <input type="text" class="form-control" id="input-phone3-text" placeholder="Mensagem no Whatsapp" aria-label="span-phone3-text" aria-describedby="span-phone3-text" value="${card['whatsapp']['text']}">
                        </div>
                        <div class="input-group flex-nowrap my-3">
                            <span class="input-group-text" id="span-email">
                                <i class="far fa-envelope"></i>
                            </span>
                            <input type="text" class="form-control col-6" id="input-email" placeholder="E-mail" aria-label="span-email" aria-describedby="span-email" value="${card['footer']['email']}">
                            <span class="input-group-text" id="span-localization">
                                <i class="fas fa-map-marked-alt"></i>
                            </span>
                            <input type="text" class="form-control col-6" id="input-localization" placeholder="Endereço" aria-label="span-localization" aria-describedby="span-localization" value="${card['footer']['location']}">
                        </div>
                        <div class="input-group flex-nowrap my-3">
                            <span class="input-group-text" id="span-website">
                                <i class="fab fa-chrome"></i>
                            </span>
                            <input type="text" class="form-control" id="input-website" placeholder="https://grupomave.com.br" aria-label="span-website" aria-describedby="span-website" value="${card['footer']['website']}">
                        </div>
                        `,
                    ], buttons = [
                        '<button type="button" class="btn btn-mave1" data-bs-dismiss="modal">Cancelar</button>',
                        '<button type="button" class="btn btn-mave2" id="card-update">Atualizar</button>'
                    ]).then((modalSelect) => {
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

                        ['keypress', 'keyup', 'keydown'].forEach(event => {
                            document.getElementById('input-username').addEventListener(event, function (e) {
                                return $('#card-username').text($(e.target).val())
                            });

                            document.getElementById('input-jobtitle').addEventListener(event, function (e) {
                                return $('#card-jobtitle').text($(e.target).val())
                            });
                        })


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

                                        if (data['success']) {
                                            photoPerfil = { path: 'assets/perfil/', name: data['data'] };

                                            $('#card-photo').get(0).src = `/${photoPerfil['path']}${photoPerfil['name']}`;

                                            return window.app.alerting('Foto de Perfil definida com sucesso!');
                                        }
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

                        document.getElementById('button-open-file').onclick = function () {
                            return window.open(`${filePresentation}`, '_blank');
                        };

                        document.getElementById('button-upload-file').onclick = function () {
                            let input = document.getElementById('input-file');

                            if (input && input.files.length > 0) {
                                $('#input-file, #button-upload-file, #button-open-file').attr('disabled', true);
                                window.app.loading(true);

                                window.app.fileUpload(input.files, 'assets/Apresentação', { type: 'temporary', index: `page-card-create-input-upload-file-user`, origin: localStorage.getItem('usr-internetadress') })
                                    .then(data => {
                                        $('#input-file')
                                            .attr('disabled', false)
                                            .val('');
                                        $('#button-upload-file').attr('disabled', true);
                                        $('#button-open-file').attr('disabled', false);
                                        window.app.loading(false);

                                        if (data['success']) {
                                            filePresentation = `/assets/Apresentação/${data['data']}`;

                                            return window.app.alerting('Arquivo de Apresentação definido com sucesso!');
                                        }
                                        else
                                            return window.app.alerting('Ocorreu um erro no envio do arquivo, tente novamente mais tarde!');
                                    })
                                    .catch(e => console.error(e))
                            }
                        };

                        document.getElementById('card-update').onclick = function () {
                            const
                                firstname = $('#input-vcard-prop-primeiro-nome').val(),
                                lastname = $('#input-vcard-prop-último-nome').val(),
                                organization = $('#input-vcard-prop-organização').val(),
                                photo = photoPerfil,
                                logo = photoLogo,
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
                                    const
                                        vcardFilename = filename,
                                        version = card['version'],
                                        photo = photoPerfil,
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
                                            firstname,
                                            lastname,
                                            organization,
                                            photo: photoPerfil,
                                            logo: photoLogo,
                                            workPhone,
                                            birthday,
                                            title,
                                            url,
                                            workUrl,
                                            email,
                                            label,
                                            street,
                                            city,
                                            stateProvince,
                                            postalCode,
                                            countryRegion,
                                            socialUrls,
                                            file: {
                                                path: 'vcf/',
                                                name: vcardFilename,
                                            }
                                        },
                                        footer = {
                                            email: $('#input-email').val(),
                                            location: $('#input-localization').val(),
                                            website: $('#input-website').val(),
                                            attachment: filePresentation,
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
                                        !id,
                                        !version,
                                        !photo,
                                        !name,
                                        !jobtitle,
                                        !phones,
                                        !whatsapp,
                                        !vcard,
                                        !footer
                                    )
                                        return window.app.alerting('Está faltando dados para atualizar o cartão digital!');

                                    window.app.cardUpdate(
                                        id,
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
                                            window.app.loading(false);
                                            url = `${window.app.baseurl}/cards/card/${url}`;
                                            window.app.cardsChangePhoto(id, photo);
                                            window.app.cardsChangeName(id, name);
                                            window.app.cardsChangeJobtitle(id, jobtitle);
                                            window.app.cardsCompressData[indexOf] = {
                                                id,
                                                version,
                                                photo,
                                                name,
                                                jobtitle,
                                                phones,
                                                whatsapp,
                                                vcard,
                                                footer
                                            }
                                            modalSelect.hide();
                                            return window.app.alerting(`Cartão atualizado com sucesso, disponível em: ${url}`, 3800);
                                        })
                                        .catch((err, details) => console.error(err, details))
                                })
                                .catch((err, details) => console.error(err, details))
                        };
                    }).catch(e => { throw new Error(e) });
                };

            if (document.getElementById(`card-remove-${id}`))
                document.getElementById(`card-remove-${id}`).onclick = function (e) {
                    window.app.loading(true);
                    window.app.cardRemove(id)
                        .then(({ success }) => {
                            window.app.loading(false);

                            if (success)
                                $(`#container-card-${id}`).fadeOut('slow', function () { $(this).remove(); });
                        })
                        .catch((err, details) => console.error(err, details))
                };
        });
    }

    // ======================================================================
    // Export to Globals(APP)
    //
    // [
    //     {
    //         'alias': 'openCard', 'function': (id) => {
    //             return window.open(`${window.app.baseurl}/cards/card/${id}`, '_blank');
    //         }
    //     },
    // ].forEach(prop => window.app[prop['alias']] = prop['function']);
})();