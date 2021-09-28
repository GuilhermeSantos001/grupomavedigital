import Controller from './hercules-controller';
import FolderController from './hercules-controller-folder';
import FileController from './hercules-controller-file';

(async function () {
    "use strict";

    // ======================================================================
    // Import of Globals(APP)
    //
    window.app = window.app || {};

    window.app.openFolderTree = Controller.drawFolderTree;

    // ======================================================================
    // Variables
    //
    let files = [],
        folders = [],
        folderName = null,
        folderId = null;

    if (window.app.compressData) {
        if (window.app.compressData['files'])
            files = JSON.parse(LZString.decompressFromEncodedURIComponent(window.app.compressData['files']));

        if (window.app.compressData['folders'])
            folders = JSON.parse(LZString.decompressFromEncodedURIComponent(window.app.compressData['folders']));

        if (window.app.compressData['folderName'])
            folderName = String(LZString.decompressFromEncodedURIComponent(window.app.compressData['folderName']));

        if (window.app.compressData['folderId'])
            folderId = String(LZString.decompressFromEncodedURIComponent(window.app.compressData['folderId']));

        if (window.app.compressData['privilegesSystem'])
            Controller.setPrivileges(JSON.parse(LZString.decompressFromEncodedURIComponent(window.app.compressData['privilegesSystem'])));

        if (window.app.compressData['trashDays'])
            Controller.setTrashDays(JSON.parse(LZString.decompressFromEncodedURIComponent(window.app.compressData['trashDays'])));

        if (window.app.compressData['extensions'])
            Controller.setFileExtensions(JSON.parse(LZString.decompressFromEncodedURIComponent(window.app.compressData['extensions'])));

        if (window.app.compressData['maxSize'])
            Controller.setFileMaxSize(JSON.parse(LZString.decompressFromEncodedURIComponent(window.app.compressData['maxSize'])));
    };

    $(() => {
        Controller.folders = folders;
        Controller.files = files;
        Controller.folderName = folderName;
        Controller.folderId = folderId;

        for (const folder of folders) {
            FolderController.create(folder);
        };

        for (const file of files) {
            FileController.create(file);
        };

        FileController.drawButtonAppend();
        FolderController.drawButtonAppend();

        Controller.drawButtonActions();
        Controller.drawConnection();
        Controller.events();

        Controller.update();
        FileController.update();
        FolderController.update();

        if (files.length <= 0 && folders.length <= 0) {
            Controller.drawMessageNoItems();
        };
    });

    // ======================================================================
    // Socket.io
    //
    const
        { token } = await window.app.storage_get_userInfo(),
        socket = io({
            "auth": {
                "token": token
            },
            "secure": true,
            "reconnectionAttempts": 4,
            "transports": ['websocket', 'polling']
        });

    socket.on("connect", (e) => {
        Controller.setSocket(socket);
    });

    socket.on("connect_error", (e) => setTimeout(() => window.location.reload(), window.app.ONE_SECOND_DELAY));

    socket.on("connect_close", () => {
        socket.emit('DISCONNECT');

        return setTimeout(() => window.location.reload(), window.app.ONE_SECOND_DELAY);
    });

    // ======================================================================
    // Export to Globals(APP)
    //
    // [
    //     { 'alias': 'dropHandler', 'function': dropHandler }
    // ].forEach(prop => window.app[prop['alias']] = prop['function']);
})();