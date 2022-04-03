import WebSocket = require('ws')
import fs = require('fs')
import deepmerge = require('deepmerge')

interface StartupRequest {
    type: 'startup'
}

interface StateResponse {
    type: 'state'
    data: unknown
}

interface StateChange {
    type: 'change'
    id: string
    data: unknown
}

type Message = StartupRequest | StateResponse | StateChange;

export default class Server {

    stateSavePath: string
    state = {}

    wss: WebSocket.Server;

    constructor(options: WebSocket.ServerOptions, stateSavePath: string) {
        this.stateSavePath = stateSavePath;
        this.loadState();

        this.wss = new WebSocket.Server({ ...options, clientTracking: true });
        this.wss.on('connection', (ws) => {
            ws.on('message', (data) => {
                const message: Message = JSON.parse(data.toString());
                this.receiveMessage(ws, message);
            });
        });

        console.log('server listening');
    }

    loadState() {
        try {
            this.state = JSON.parse(fs.readFileSync(this.stateSavePath).toString('utf8'))
        }
        catch (error) {
            const code = (error as any)?.code;
            const fileExists = code !== 'ENOENT';

            if (fileExists) {
                console.error(`failed to load ${this.stateSavePath} even though it exists`);
                process.exit(1);
            }
        }
    }

    saveState() {
        fs.writeFileSync(this.stateSavePath + '.tmp', JSON.stringify(this.state));
        fs.renameSync(this.stateSavePath + '.tmp', this.stateSavePath);
    }

    receiveMessage(ws: WebSocket, message: Message) {
        switch (message.type) {
            case "startup":
                this.sendState(ws);
                break;

            case "change":
                this.applyChange(message);
                this.forwardChanges(message);
                break;

            case "state":
                this.sendError(ws, "Server should never be sent a state");
                break;

            default:
                this.sendError(ws, "Unexpected message type");
                break;
        }
    }

    sendState(ws: WebSocket) {
        ws.send(JSON.stringify({
            type: "state",
            data: this.state,
        }));
    }

    applyChange(change: StateChange) {
        this.state = deepmerge(this.state, change.data as any)
        this.saveState();
    }

    forwardChanges(change: StateChange) {
        this.wss.clients.forEach((ws: WebSocket) => {
            ws.send(JSON.stringify(change));
        });
    }

    sendError(ws: WebSocket, message: string) {
        ws.send(JSON.stringify({
            type: "error",
            message: message
        }));
    }
}
