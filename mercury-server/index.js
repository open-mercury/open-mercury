const { Db } = require('./db');
const WebSocket = require('ws');

const db = new Db('state.json');

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

wss.on('connection', (ws) => {
    ws.on('message', (data) => {
        console.log('received: %s', data);

        const message = JSON.parse(data);

        if (message.type === 'set') {
            db.apply(message.data);
        }

        const messageString = JSON.stringify({
            type: 'state',
            state: db.state
        });

        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(messageString);
            }
        });
    });

    console.log("new connection");
});


