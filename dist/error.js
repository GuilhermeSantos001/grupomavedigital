(function () {
    "use strict";

    // ======================================================================
    // Import of Globals(APP)
    //     
    window.app = window.app || {};

    $(document).ready(() => { console.log(window.app.pagedata('error')); })

    // ======================================================================
    // Export to Globals(APP)
    //     
    // [
    //     { 'alias': '', 'function':  },
    // ].forEach(prop => window.app[prop['alias']] = prop['function']);
})();