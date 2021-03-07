(function () {
    "use strict";

    // ======================================================================
    // Import of Globals(APP)
    //
    window.app = window.app || {};

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
    // Export to Globals(APP)
    //
    // [
    //     { 'alias': 'login', 'function': login },
    // ].forEach(prop => window.app[prop['alias']] = prop['function']);
})();