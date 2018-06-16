import WebSocket = require('ws')
import fs = require('fs')
import deepmerge = require('deepmerge')

export default class Server {
    wss: WebSocket.Server;
    state = {}

    constructor(options: WebSocket.ServerOptions) {
        this.wss = new WebSocket.Server({ ...options, clientTracking: true });
        this.wss.on('connection', (ws) => {
            ws.on('message', (data) => {
                this.receiveMessage(ws, JSON.parse(data.toString()));
            });
        });
    }

    loadState(filePath: string) {
        this.state = JSON.parse(fs.readFileSync(filePath).toString('utf8'))
    }

    saveState(filePath: string) {
        fs.writeFileSync(filePath, JSON.stringify(this.state))
    }

    receiveMessage(ws: WebSocket, message: any) {
        switch (message.type) {
        case "state":
            this.sendState(ws);
            break;
        case "set":
            this.updateState(message.data);
            break;
        default:
            this.sendError(ws, "Bad request");
            break;
        }
    }

    updateState(changes: any) {
        this.state = deepmerge(this.state, changes)
        this.wss.clients.forEach((ws: WebSocket) => {
            this.sendState(ws);
        });
    }

    sendState(ws: WebSocket) {
        ws.send(JSON.stringify({
            type: "state",
            state: this.state
        }));
    }

    sendError(ws: WebSocket, message: string) {
        ws.send(JSON.stringify({
            type: "error",
            message: message
        }));
    }
}