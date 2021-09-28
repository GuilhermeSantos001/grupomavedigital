(function () {
    "use strict";

    // ======================================================================
    // Import of Globals(APP)
    //
    window.app = window.app || {};

    // ======================================================================
    // Events
    //
    window.app.filter_input("app-input-search", "list-cards", "a", ["h5", "p"]);

    // ======================================================================
    // Export to Globals(APP)
    //
    [
        {
            'alias': 'openCard', 'function': (id) => {
                return window.open(`${window.app.baseurl}/cards/card/${id}`, '_blank');
            }
        },
    ].forEach(prop => window.app[prop['alias']] = prop['function']);
})();