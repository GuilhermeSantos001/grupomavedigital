(function () {
    "use strict";

    // ======================================================================
    // Import of Globals(APP)
    //
    window.app = window.app || {};

    // ======================================================================
    // Formatter
    //
    function formatter_date(str) {
        let day = str.substring(0, str.indexOf('T')),
            time = str.substring(str.indexOf('T') + 1, str.lastIndexOf('-'));

        return `${day} - ${time}`;
    };

    // ======================================================================
    // Lists
    //
    let
        _optionsList = {
            valueNames: [
                'index',
                'created',
                'ipremote',
                'auth',
                'privilege',
                'roadmap'
            ],
            item: 'activities-item'
        },
        _activitiesList = new List('activities-list', _optionsList),
        _acIndex = 0,
        _activities = [];

    const
        __activities_append = function (items) {
            if (items.length > 0)
                items
                    .reverse()
                    .slice(0, 100)
                    .filter(item => _activities.indexOf(item['id']) === -1)
                    .forEach(item => {
                        _activitiesList.add({
                            index: `:${++_acIndex}`,
                            created: `Criado em: ${formatter_date(item['created'])}`,
                            ipremote: `Endereço de IP: ${item['ipremote']}`,
                            auth: `Usuário: ${item['auth']}`,
                            privilege: `Cargo: ${item['privilege']}`,
                            roadmap: `Rotina: ${item['roadmap']}`
                        });

                        _activities.push(item['id']);
                    });
        };

    // ======================================================================
    // Chart
    //
    let
        options = [
            {
                responsive: false,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        align: 'center',
                        text: 'Total de Usuários'
                    }
                }
            }
        ],
        data = [
            {
                labels: ["Ativos", "Inativos"],
                datasets: [
                    {
                        label: "Usuários",
                        backgroundColor: [
                            "rgba(46, 228, 71, 1)",
                            "rgba(228, 46, 46, 1)"
                        ],
                        hoverOffset: 4,
                        data: [10, 5],
                    }
                ]
            }
        ],
        charts = [
            new Chart($('#chart-total-users'), {
                type: 'pie',
                options: options[0],
                data: data[0]
            })
        ];

    // ======================================================================
    // Socket.io
    //
    const
        socket = io(),
        __GET_ACTIVITIES = function (limit = 100) {
            return socket.emit("GET_ACTIVITIES", limit);
        },
        __GET_CHART_USER_TOTAL = function () {
            return socket.emit("GET_CHART_USER_TOTAL");
        };

    socket.on("connect", () => {
        setInterval(() => {
            __GET_ACTIVITIES();
            __GET_CHART_USER_TOTAL();
        }, 3000000); // Atualiza a cada 5 Minutos

        __GET_ACTIVITIES();
        __GET_CHART_USER_TOTAL();
    });

    socket.on(
        "POST_ACTIVITIES",
        activities => __activities_append(JSON.parse(LZString.decompressFromEncodedURIComponent(activities)))
    );

    socket.on(
        "POST_CHART_USER_TOTAL",
        res => {
            const { totals } = JSON.parse(LZString.decompressFromEncodedURIComponent(res));

            charts[0].data.datasets[0].data[0] = totals[0];
            charts[0].data.datasets[0].data[1] = totals[1];
            charts[0].update();
        }
    );

    // ======================================================================
    // Export to Globals(APP)
    //
    // [
    //     { 'alias': '', 'function':  },
    // ].forEach(prop => window.app[prop['alias']] = prop['function']);
})();