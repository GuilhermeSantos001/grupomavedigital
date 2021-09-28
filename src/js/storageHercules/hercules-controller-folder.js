/**
 * @description Controlador de pastas
 * @author @GuilhermeSantos001
 * @update 04/08/2021
 * @version 1.0.0
 */

import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

import Controller from './hercules-controller';

export default class FolderController extends Controller {
    constructor() { };

    static folders = [];

    static find(cid) {
        return this.folders.filter(folder => folder.cid === cid)[0];
    };

    static create(folder) {
        const _folder = this.find(folder.cid);

        if (!_folder) {
            this.folders.push(folder);
            this.append(folder, 'folder', true);
        };
    };

    static drawButtonAppend() {
        $(this.layerButtonCreate)
            .append(`
            <button type="button" class="btn btn-outline-primary col mx-2" data-bs-toggle="modal" data-bs-target="#modal_new_folder">
                <i class="icon-plus-square me-2"></i> Adicionar Pasta
            </button>
            `);

        $(this.layerMain)
            .append(`
            <div class="modal fade" id="modal_new_folder" tabindex="-1" data-bs-keyboard="true" aria-labelledby="modal_new_folder_title" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                    <div class="modal-content">
                        <div class="modal-header bg-primary bg-gradient text-secondary fw-bold">
                            <h5 class="modal-title" id="modal_new_folder_title">
                            Criar nova pasta
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p class="col-12 mb-2 text-muted fw-bold">
                            Os seguintes caracteres especiais não são permitidos: <br />
                            ${String(this.specialCharacters()).replace(/\[|\]|g/g, '')}
                            </p>
                            <div class="input-group">
                                <span class="input-group-text" id="addon-new-folder-name">
                                    <i class="icon-folder"></i>
                                </span>
                                <input type="text" class="form-control" id="new-folder-name" placeholder="Nome da Pasta..." aria-label="new-folder-name" aria-describedby="addon-new-folder-name" value="">
                            </div>
                            <div class="input-group my-2">
                                <span class="input-group-text" id="addon-new-folder-tag">
                                    <i class="icon-tag"></i>
                                </span>
                                <input type="text" class="form-control" id="new-folder-tag" placeholder="Marcação da Pasta..." aria-label="new-folder-tag" aria-describedby="addon-new-folder-tag" value="" disabled>
                            </div>
                            <div class="input-group my-2">
                                <span class="input-group-text" id="addon-new-folder-type">
                                    <i class="icon-quote-right"></i>
                                </span>
                                <input type="text" class="form-control" id="new-folder-type" placeholder="Tipo da pasta..." aria-label="new-folder-type" aria-describedby="addon-new-folder-type" value="" disabled>
                            </div>
                            <div class="form-floating my-2">
                                <textarea class="form-control" placeholder="Descrição da Pasta..." id="new-folder-description" style="height: 100px" disabled></textarea>
                                <label for="new-folder-description">Descrição</label>
                            </div>
                            <p class="col-12 my-1 text-muted fw-bold" id="count-folder-description">
                            Tamanho da descrição: 0/256. Minimo de 25 caracteres.
                            </p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" id="save-new-folder" data-bs-dismiss="modal" disabled>
                            Salvar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            `);

        const
            afterInputChange = function () {
                if (
                    window.app.input().valueIsMinAndMax('new-folder-name', 5, 256) &&
                    !window.app.input().valueContainsCustomsCharacters('new-folder-name', FolderController.specialCharacters())
                ) {
                    window.app.input().isValid('new-folder-name');
                    window.app.input().enable('new-folder-tag');
                } else {
                    window.app.input().isInvalid('new-folder-name');
                    window.app.input().disable('new-folder-tag');
                    window.app.input().disable('new-folder-type');
                    window.app.input().disable('new-folder-description');

                    return window.app.input().disable('save-new-folder');
                }

                if (
                    window.app.input().valueIsMinAndMax('new-folder-tag', 5, 256) &&
                    !window.app.input().valueContainsCustomsCharacters('new-folder-tag', FolderController.specialCharacters())
                ) {
                    window.app.input().isValid('new-folder-tag');
                    window.app.input().enable('new-folder-type');
                } else {
                    window.app.input().isInvalid('new-folder-tag');
                    window.app.input().disable('new-folder-type');
                    window.app.input().disable('new-folder-description');

                    return window.app.input().disable('save-new-folder');
                }

                if (
                    window.app.input().valueIsMinAndMax('new-folder-type', 5, 256) &&
                    !window.app.input().valueContainsCustomsCharacters('new-folder-type', FolderController.specialCharacters())
                ) {
                    window.app.input().isValid('new-folder-type');
                    window.app.input().enable('new-folder-description');
                } else {
                    window.app.input().isInvalid('new-folder-type');
                    window.app.input().disable('new-folder-description');

                    return window.app.input().disable('save-new-folder');
                }

                if (
                    window.app.input().valueIsMinAndMax('new-folder-description', 25, 256) &&
                    !window.app.input().valueContainsCustomsCharacters('new-folder-description', FolderController.specialCharacters())
                ) {
                    window.app.input().isValid('new-folder-description');
                } else {
                    window.app.input().isInvalid('new-folder-description');

                    return window.app.input().disable('save-new-folder');
                }

                return window.app.input().enable('save-new-folder');
            };

        $('#new-folder-name, #new-folder-tag, #new-folder-type, #new-folder-description').on({
            change: afterInputChange,
            keyup: afterInputChange
        });

        $('#new-folder-description').on({
            keyup: function () {
                $('#count-folder-description')
                    .text(`Tamanho da descrição: ${$(this).val().length}/256. Minimo de 25 caracteres.`)
            }
        });

        $('#save-new-folder').on("click", this.save.bind(this, () => {
            window.app.input().setValue([
                'new-folder-name',
                'new-folder-description',
                'new-folder-tag',
                'new-folder-type'
            ], "");

            afterInputChange();

            window.app.input().clearValidOrInvalid([
                'new-folder-name',
                'new-folder-description',
                'new-folder-tag',
                'new-folder-type'
            ]);
        }));
    };

    static async save(callback) {
        const
            { auth, email } = await window.app.storage_get_userInfo(),
            name = $('#new-folder-name').val(),
            description = $('#new-folder-description').val(),
            type = $('#new-folder-type').val(),
            tag = $('#new-folder-tag').val();

        this.drawStatusSteps();
        this.drawStep('create-folder', 'Criando pasta...');

        setTimeout(() => {
            this.emit('CREATE-FOLDER',
                compressToEncodedURIComponent(
                    JSON.stringify({
                        authorId: auth,
                        email,
                        name,
                        description,
                        type,
                        tag
                    })
                )
            );
        }, this.delayStep);

        this.on('CREATE-FOLDER-SUCCESS', async (folder) => {
            folder = JSON.parse(decompressFromEncodedURIComponent(folder));

            this.global('APPEND-ITEM', compressToEncodedURIComponent(folder.cid), compressToEncodedURIComponent('folder'));

            this.completeStep('create-folder');
            this.drawButtonsStep();

            if (typeof callback == 'function')
                return callback();
        });

        this.on('CREATE-FOLDER-ERROR', (error, filename) => {
            error = JSON.parse(decompressFromEncodedURIComponent(error));
            filename = decompressFromEncodedURIComponent(filename);

            this.warningStep('create-folder');
            this.drawButtonsStep();

            this.drawDetailsSteps(`Ocorreu um erro na hora de salvar a pasta: ${filename}, detalhes:`);
            this.drawDetailsSteps(JSON.stringify(error));

            console.log('CREATE-FILE-ERROR', error);
        });

        if (typeof callback === 'function')
            return callback();
    };

    static update() { };
};