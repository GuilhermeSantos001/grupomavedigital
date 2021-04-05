/** FUNCTIONS */
function fetchStuffAndInitDatabases() {
    console.log('TESTE DATABASE');
}

/** SELF */
self.addEventListener('install', function (event) {
    event.waitUntil(
        fetchStuffAndInitDatabases()
    );
});

self.addEventListener('activate', function (event) {
    console.log('Claiming control');
    return self.clients.claim();
});

self.addEventListener('fetch', function (event) {
    event.respondWith(new Response("Hello world!"));
});