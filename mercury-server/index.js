const db = require('./db');
const WebSocket = require('ws');

const wss = new WebSocket.Server({
    port: 8080,
    perMessageDeflate: {
        zlibDeflateOptions: {
            chunkSize: 1024,
            memLevel: 7,
            level: 3,
        },
        zlibInflateOptions: {
            chunkSize: 10 * 1024
        },
        clientNoContextTakeover: true,
        serverNoContextTakeover: true,
        clientMaxWindowBits: 10,
        serverMaxWindowBits: 10,

        concurrencyLimit: 10,
        threshold: 1024,
    }
});

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
    });

    const stateString = db.toString(db.state);

    ws.send(JSON.stringify({
        type: 'state',
        data: stateString
    }));

    ws.send('something');
});


