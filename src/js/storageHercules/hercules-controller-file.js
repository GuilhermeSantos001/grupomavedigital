/**
 * @description Controlador de arquivos
 * @author @GuilhermeSantos001
 * @update 04/08/2021
 * @version 1.0.0
 */

import byteSize from 'byte-size';

import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

import Controller from './hercules-controller';

export default class FileController extends Controller {
    constructor() { };

    static files = [];
    static newFile = null;

    static find(cid) {
        return this.files.filter(file => file.cid === cid)[0];
    };

    static create(file) {
        const _file = this.find(file.cid);

        if (!_file) {
            this.files.push(file);
            this.append(file, 'file');
        };
    };

    static drawButtonAppend() {
        $(this.layerButtonCreate)
            .append(`
            <button type="button" class="btn btn-outline-primary col mx-2" data-bs-toggle="modal" data-bs-target="#modal_new_file">
                <i class="icon-plus-square me-2"></i> Adicionar Arquivo
            </button>
            `);

        $(this.layerMain)
            .append(`
            <div class="modal fade" id="modal_new_file" tabindex="-1" data-bs-keyboard="true" aria-labelledby="modal_new_file_title" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                    <div class="modal-content">
                        <div class="modal-header bg-primary bg-gradient text-secondary fw-bold">
                            <h5 class="modal-title" id="modal_new_file_title">
                            Criar novo arquivo
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p class="col-12 mb-2 text-muted fw-bold">
                            Os seguintes caracteres especiais não são permitidos: <br />
                            ${String(this.specialCharacters()).replace(/\[|\]|g/g, '')}
                            </p>
                            <div class="input-group">
                                <span class="input-group-text" id="addon-new-file-name">
                                    <i class="icon-file"></i>
                                </span>
                                <input type="text" class="form-control" id="new-file-name" placeholder="Nome do Arquivo..." aria-label="new-file-name" aria-describedby="addon-new-file-name" value="">
                            </div>
                            <div class="input-group my-2">
                                <span class="input-group-text" id="addon-new-file-tag">
                                    <i class="icon-tag"></i>
                                </span>
                                <input type="text" class="form-control" id="new-file-tag" placeholder="Marcação do Arquivo..." aria-label="new-file-tag" aria-describedby="addon-new-file-tag" value="" disabled>
                            </div>
                            <div class="form-floating my-2">
                                <textarea class="form-control" placeholder="Descrição do Arquivo..." id="new-file-description" style="height: 100px" disabled></textarea>
                                <label for="new-file-description">Descrição</label>
                            </div>
                            <p class="col-12 my-1 text-muted fw-bold" id="count-file-description">
                            Tamanho da descrição: 0/256. Minimo de 25 caracteres.
                            </p>
                            <div class="input-group my-2">
                                <div class="col-12">
                                    <label for="input-file" class="form-label fw-bold text-mave1 fs-5">
                                        Escolher arquivo do computador
                                    </label>
                                    <input class="form-control" type="file" id="input-file" accept="${Controller.extensions().join(",")}">
                                </div>
                            </div>
                            <p class="col-12 border p-2 my-2 text-center text-muted fw-bold drop transition">
                            Arraste e solte o arquivo aqui!!!
                            </p>
                            <p class="col-12 my-1 text-muted fw-bold drop-fileSize">
                            Tamanho máximo permitido: 20 MB
                            </p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" id="upload-new-file" data-bs-dismiss="modal" disabled>
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
                    window.app.input().valueIsMinAndMax(['new-file-name'], 5, 256) &&
                    !window.app.input().valueContainsCustomsCharacters(['new-file-name'], FileController.specialCharacters())
                ) {
                    window.app.input().isValid(['new-file-name']);
                    window.app.input().enable(['new-file-tag']);
                } else {
                    window.app.input().isInvalid(['new-file-name']);
                    window.app.input().disable(['new-file-tag']);
                    window.app.input().disable(['new-file-description']);

                    return window.app.input().disable('upload-new-file');
                };

                if (
                    window.app.input().valueIsMinAndMax(['new-file-tag'], 5, 256) &&
                    !window.app.input().valueContainsCustomsCharacters(['new-file-tag'], FileController.specialCharacters())
                ) {
                    window.app.input().isValid(['new-file-tag']);
                    window.app.input().enable(['new-file-description']);
                } else {
                    window.app.input().isInvalid(['new-file-tag']);
                    window.app.input().disable(['new-file-description']);

                    return window.app.input().disable('upload-new-file');
                };

                if (
                    window.app.input().valueIsMinAndMax(['new-file-description'], 25, 256) &&
                    !window.app.input().valueContainsCustomsCharacters(['new-file-description'], FileController.specialCharacters())
                ) {
                    window.app.input().isValid(['new-file-description']);
                } else {
                    window.app.input().isInvalid(['new-file-description']);

                    return window.app.input().disable('upload-new-file');
                };

                if (FileController.newFile)
                    return window.app.input().enable('upload-new-file');
            },
            fileIsValid = (filename, filesize) => {
                return window.app.fileContainValidExtensionAndSize(filename, filesize, Controller.extensions(), Controller.maxSize());
            },
            afterDropFile = function (filename, filesize) {
                if (fileIsValid(filename, filesize)) {
                    if (
                        Controller.cache_list_getter('updateFile') &&
                        Controller.cache_list_getter('updateFile').includes(true) &&
                        !Controller.cache_list_getter('updateFileType').includes(filename.substring(filename.lastIndexOf('.')))
                    ) {
                        return window.app.alerting(`A extensão ${filename.substring(filename.lastIndexOf('.'))} do arquivo não é compatível com seu arquivo ${Controller.cache_list_getter('updateFileFullName')[0]}`);
                    };

                    $('.drop').text(`Arquivo: ${filename}`);
                    $('.drop-fileSize').text(`Tamanho do Arquivo: ${byteSize(filesize)}`);

                    window.app.input().setValue('input-file', "");

                    if (window.app.input().valueIsLess(['new-file-name'], 0)) {
                        window.app.input().setValue(['new-file-name'], filename.substring(0, filename.lastIndexOf('.')));
                        window.app.input().valueClearCustomsCharacters(['new-file-name'], FileController.specialCharacters());
                    };

                    return afterInputChange();
                };
            };

        $('#input-file').on("change", function (event) {
            let input = document.getElementById('input-file');

            if (input && input.files.length > 0) {
                const file = input.files[0];

                FileController.newFile = file;

                return afterDropFile(file.name, file.size);
            };
        });

        $('.drop').on('drop dragdrop', function (event) {
            event.preventDefault();

            if (!$(this).hasClass("text-muted"))
                $(this)
                    .removeClass("bg-success text-light")
                    .addClass("text-muted");

            if (event.originalEvent.dataTransfer.items) {
                // Use a interface DataTransferItemList para acessar o (s) arquivo (s)
                if (event.originalEvent.dataTransfer.items.length > 0) {
                    // Se os itens soltos não forem arquivos, rejeite-os
                    if (event.originalEvent.dataTransfer.items[0].kind === 'file') {
                        const file = event.originalEvent.dataTransfer.items[0].getAsFile();

                        FileController.newFile = file;

                        afterDropFile(file.name, file.size);
                    };
                };
            } else {
                // Use a interface DataTransfer para acessar o (s) arquivo (s)
                if (event.originalEvent.dataTransfer.length > 0) {
                    const file = event.originalEvent.dataTransfer.files[0];

                    FileController.newFile = file;

                    afterDropFile(file.name, file.size);
                };
            };
        });

        $('.drop').on('dragenter', function (event) {
            event.preventDefault();

            if ($(this).hasClass("text-muted"))
                $(this)
                    .removeClass("text-muted")
                    .addClass("bg-success text-light");
        });

        $('.drop').on('dragleave', function () {
            if (!$(this).hasClass("text-muted"))
                $(this)
                    .removeClass("bg-success text-light")
                    .addClass("text-muted");
        });

        $('.drop').on('dragover', function (event) {
            event.preventDefault();
        });

        $('#new-file-name, #new-file-tag, #new-file-description').on({
            change: afterInputChange,
            keyup: afterInputChange
        });

        $('#new-file-description').on({
            keyup: function () {
                $('#count-file-description')
                    .text(`Tamanho da descrição: ${$(this).val().trim().length}/256. Minimo de 25 caracteres.`)
            }
        });

        $('#upload-new-file').on("click", this.upload.bind(this, () => {
            window.app.input().setValue([
                'input-file',
                'new-file-name',
                'new-file-description',
                'new-file-tag'
            ], "");

            $('.drop').text(`Arraste e solte o arquivo aqui!!!`);

            $('.drop-fileSize').text(`Tamanho máximo permitido: 20 MB`);

            window.app.input().disable('upload-new-file');

            FileController.newFile = null;

            afterInputChange();

            window.app.input().clearValidOrInvalid([
                'input-file',
                'new-file-name',
                'new-file-description',
                'new-file-tag'
            ]);
        }));
    };

    static async upload(callback) {
        if (!FileController.newFile)
            return;

        if (
            !Controller.cache_list_getter('updateFile') ||
            Controller.cache_list_getter('updateFile') &&
            Controller.cache_list_getter('updateFile').includes(false)
        ) {
            try {
                const
                    { auth, email } = await window.app.storage_get_userInfo(),
                    name = $('#new-file-name').val().trim(),
                    description = $('#new-file-description').val().trim(),
                    extension = FileController.newFile.name.slice(FileController.newFile.name.lastIndexOf('.')),
                    tag = $('#new-file-tag').val().trim();

                this.drawStatusSteps();
                this.drawStep('create-file', 'Criando o arquivo...');

                setTimeout(() => {
                    this.emit('CREATE-FILE',
                        compressToEncodedURIComponent(
                            JSON.stringify({
                                authorId: auth,
                                email,
                                name,
                                description,
                                type: extension,
                                tag
                            })
                        )
                    );
                }, this.delayStep);

                this.on('CREATE-FILE-SUCCESS', async (file) => {
                    file = JSON.parse(decompressFromEncodedURIComponent(file));

                    this.global('APPEND-ITEM', compressToEncodedURIComponent(file.cid), compressToEncodedURIComponent('file'));

                    this.completeStep('create-file');

                    this.drawStep('save-first-version', 'Salvando a primeira versão...');
                    this
                        .appendVersion(file, FileController.newFile)
                        .then(data => {
                            this.completeStep('save-first-version');
                            this.drawButtonsStep();

                            const
                                { version } = data,
                                item = this.getCacheItem(file.cid);

                            if (version) {
                                this.global('ITEM-UPDATE-AND-UPDATE-VERSION', compressToEncodedURIComponent(item.cid), compressToEncodedURIComponent(item.typeof));
                            };

                            if (typeof callback == 'function')
                                return callback();
                        })
                        .catch(error => {
                            let textError;

                            if (error.responseText) {
                                textError = JSON.parse(error.responseText);
                                textError = textError.data;
                            };

                            this.warningStep('save-first-version');
                            this.drawButtonsStep();

                            this.drawDetailsSteps(`Ocorreu um erro na hora de salvar a versão inicial do arquivo: ${window.app.valueClearCustomsCharacters(FileController.newFile.name, FileController.specialCharacters())}, detalhes:`);
                            this.drawDetailsSteps(JSON.stringify(error));

                            console.log('APPEND_VERSION_ERROR', error);
                        });
                });

                this.on('CREATE-FILE-ERROR', (error) => {
                    error = JSON.parse(decompressFromEncodedURIComponent(error));

                    this.warningStep('create-file');
                    this.drawButtonsStep();

                    this.drawDetailsSteps(`Ocorreu um erro na hora de salvar o arquivo: ${window.app.valueClearCustomsCharacters(FileController.newFile.name, FileController.specialCharacters())}, detalhes:`);
                    this.drawDetailsSteps(JSON.stringify(error));

                    console.log('CREATE-FILE-ERROR', error);
                });
            } catch (error) {
                this.warningStep('create-file');
                this.drawButtonsStep();

                this.drawDetailsSteps(`Não foi possível criar o arquivo: ${window.app.valueClearCustomsCharacters(FileController.newFile.name, FileController.specialCharacters())}, devido ao erro:`);
                this.drawDetailsSteps(JSON.stringify(error));

                console.log('CREATE-FILE-ERROR', error);
            };
        }
        /**
         * * Método para atualizar o arquivo
         */
        else {
            try {
                this.drawStatusSteps();
                this.drawStep('update-version-file', 'Salvando a nova versão do arquivo...');

                const
                    cid = Controller.cache_list_getter('updateFileCid')[0],
                    item = this.getCacheItem(cid),
                    name = $('#new-file-name').val().trim(),
                    description = $('#new-file-description').val().trim(),
                    tag = $('#new-file-tag').val().trim(),
                    permission = await this.getUserPermission(item, 'Write');

                /**
                 * * Adiciona a nova versão dos dados do arquivo
                 */
                this
                    .appendVersion(this.getCacheItem(cid), FileController.newFile)
                    .then(data => {
                        this.completeStep('update-version-file');

                        const
                            { version } = data,
                            item = this.getCacheItem(cid);

                        if (version) {
                            this.global('ITEM-UPDATE-AND-UPDATE-VERSION', compressToEncodedURIComponent(item.cid), compressToEncodedURIComponent(item.typeof));
                        };

                        /**
                         * * Atualiza as informações do arquivo
                         */
                        if (
                            item.name !== name ||
                            item.description !== description ||
                            item.tag !== tag
                        ) {
                            this.drawStep('update-info-file', 'Atualizando as informações do arquivo...');

                            setTimeout(() => {
                                this.emit('UPDATE-FILE',
                                    compressToEncodedURIComponent(cid),
                                    compressToEncodedURIComponent(permission),
                                    compressToEncodedURIComponent(
                                        JSON.stringify({
                                            name,
                                            description,
                                            tag
                                        })
                                    )
                                );
                            }, this.delayStep);

                            this.on('UPDATE-FILE-ERROR', (error) => {
                                error = JSON.parse(decompressFromEncodedURIComponent(error));

                                this.warningStep('update-info-file');
                                this.drawButtonsStep();

                                this.drawDetailsSteps(`Ocorreu um erro na hora de atualizar as informações do arquivo: ${item.name}, detalhes:`);
                                this.drawDetailsSteps(JSON.stringify(error));

                                console.log('UPDATE-FILE-ERROR', error);
                            });
                        } else { this.drawButtonsStep(); };

                        if (typeof callback == 'function')
                            return callback();
                    })
                    .catch(error => {
                        let textError;

                        if (error.responseText) {
                            textError = JSON.parse(error.responseText);
                            textError = textError.data;
                        };

                        this.warningStep('update-version-file');
                        this.drawButtonsStep();

                        this.drawDetailsSteps(`Ocorreu um erro na hora de salvar a versão inicial do arquivo: ${window.app.valueClearCustomsCharacters(FileController.newFile.name, FileController.specialCharacters())}, detalhes:`);
                        this.drawDetailsSteps(JSON.stringify(error));

                        console.log('APPEND_VERSION_ERROR', error);
                    });
            } catch (error) {
                this.warningStep('update-info-file');
                this.warningStep('update-version-file');
                this.drawButtonsStep();

                this.drawDetailsSteps(`Não foi possível atualizar o arquivo: ${window.app.valueClearCustomsCharacters(FileController.newFile.name, FileController.specialCharacters())}, devido ao erro:`);
                this.drawDetailsSteps(JSON.stringify(error));

                console.log('UPDATE-FILE-ERROR', error);
            };
        };
    };

    static appendVersion(file, blob) {
        return new Promise(async (resolve, reject) => {
            const form = new FormData(),
                { token, internetadress } = await window.app.storage_get_userInfo(),
                permission = await this.getUserPermission(file, 'Write');

            form.append(`attachment`, blob);

            const settings = {
                "async": true,
                "crossDomain": true,
                "url": `${window.app.baseurl}/system/storage/hercules/version/append`,
                "method": "POST",
                "headers": {
                    "usr_token": token,
                    "usr_internetadress": internetadress,
                    "cid": file.cid,
                    "permission": permission
                },
                "processData": false,
                "contentType": false,
                "mimeType": "multipart/form-data",
                "data": form
            };

            $.ajax(settings)
                .done(function (response) {
                    return resolve(JSON.parse(response));
                })
                .fail(function (error) {
                    return reject(error);
                });
        });
    };

    static async removeVersions(cid, versions) {
        Controller.removeVersions.call(this, cid, versions);

        const item = this.getCacheItem(cid),
            permission = await this.getUserPermission(item, 'Delete');

        this.drawStatusSteps();
        this.drawStep(`file-remove-versions-${cid}`, `As seguintes versões estão sendo removidas:\n${versions.join(', ')}`);

        this.broadcast('ITEM-BUSY', compressToEncodedURIComponent(cid));

        setTimeout(() => {
            this.emit('FILE-VERSION-REMOVE',
                compressToEncodedURIComponent(cid),
                compressToEncodedURIComponent(permission),
                compressToEncodedURIComponent(JSON.stringify(versions))
            );
        }, this.delayStep);
    };

    static update() {
        this.updateVersion();
        this.updateInfo();
    };

    static updateVersion() {
        this.on('UPDATE-VERSION', async (cid, versions, version) => {
            cid = decompressFromEncodedURIComponent(cid);
            versions = decompressFromEncodedURIComponent(versions);
            version = decompressFromEncodedURIComponent(version);

            const item = this.getCacheItem(cid),
                permission = await this.getUserPermission(item, 'Read');

            $(`#input-versions-${item.index}, #input-history-versions-length-${item.index}`).val(`${versions > 0 ? `Versões: ${versions}` : `Não há versões`}`);
            $(`#input-version-${item.index}, #input-version-actual-${item.index}`).val(`${version > 0 ? `Versão Atual: ${version}` : `-`}`);

            if (
                Number(versions) > 0
            ) {
                this.drawHistoryVersion(
                    `Versão: ${version}`,
                    version,
                    item.name,
                    item.type,
                    item.cid,
                    item.index,
                    permission
                );
            };
        });

        this.on('FILE-VERSION-REMOVE-SUCCESS', async (cid, versions) => {
            cid = decompressFromEncodedURIComponent(cid);
            versions = JSON.parse(decompressFromEncodedURIComponent(versions));

            this.completeStep(`file-remove-versions-${cid}`);
            this.drawButtonsStep();

            const item = this.getCacheItem(cid);

            for (const version of versions) {
                if ($(`#select-version-for-multiple-download-${version}-${item.index}`).is(':checked'))
                    $(`#select-version-for-multiple-download-${version}-${item.index}`).trigger('click');

                $(`#container-history-version-${version}-${item.index}`).fadeOut('fast', function () {
                    $(this).remove();

                    let cache = Controller.cache_list_getter(`draw-history-versions-${item.index}`);

                    if (cache.indexOf(String(version)) !== -1)
                        cache.splice(cache.indexOf(String(version)), 1);

                    Controller.cache_list_replaceAll(`draw-history-versions-${item.index}`, cache);
                });
            };
        });
    };

    static updateInfo() {
        this.on('UPDATE-FILE-SUCCESS', async (cid, name, description, tag) => {
            cid = decompressFromEncodedURIComponent(cid);
            name = decompressFromEncodedURIComponent(name);
            description = decompressFromEncodedURIComponent(description);
            tag = decompressFromEncodedURIComponent(tag);

            const item = this.getCacheItem(cid);

            $(`#input-item-name-${item.index}`).val(name);
            $(`#floating-textarea-description-${item.index}`).val(description);
            $(`#input-item-tag-${item.index}`).val(tag);

            $(`#container-item-name-${item.index}`)
                .html(`
                <i class="icon-file me-2"></i> ${name}${item.type}
                `);

            this.completeStep(`update-info-file`);
            this.drawButtonsStep();

            this.updateCacheItem(cid, { name, description, tag });
        });
    };
};