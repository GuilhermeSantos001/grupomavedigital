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
    // Export to Globals(APP)
    //  
    // [
    //     { 'alias': '', 'function':  },
    // ].forEach(prop => window.app[prop['alias']] = prop['function']);
})();