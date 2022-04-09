import WebSocket from 'ws';
import fs from 'fs';

import { DispatchAction, Message } from './shared/messages';

export default class Server {
    savePath: string
    actions: any[] = []

    wss: WebSocket.Server;

    constructor(options: WebSocket.ServerOptions, savePath: string) {
        this.savePath = savePath;
        this.loadActions();

        this.wss = new WebSocket.Server({ ...options, clientTracking: true });
        this.wss.on('connection', (ws) => {
            ws.on('message', (data) => {
                const message: Message = JSON.parse(data.toString());
                this.receiveMessage(ws, message);
            });
        });

        console.log('server listening');
    }

    loadActions() {
        try {
            this.actions = JSON.parse(fs.readFileSync(this.savePath).toString('utf8'))
        }
        catch (error) {
            const code = (error as any)?.code;
            const fileExists = code !== 'ENOENT';

            if (fileExists) {
                console.error(`failed to load ${this.savePath} even though it exists`);
                process.exit(1);
            }
        }
    }

    saveActions() {
        fs.writeFileSync(this.savePath + '.tmp', JSON.stringify(this.actions));
        fs.renameSync(this.savePath + '.tmp', this.savePath);
    }

    receiveMessage(ws: WebSocket, message: Message) {
        switch (message.type) {
            case 'startup':
                this.forwardAllActions(ws);
                break;

            case 'dispatch':
                this.applyAction(message);
                this.forwardAction(message);
                break;

            default:
                this.sendError(ws, 'Unexpected message type');
                break;
        }
    }

    sendMessage(ws: WebSocket, message: Message) {
        ws.send(JSON.stringify(message));
    }

    broadcastMessage(message: Message) {
        const messageJson = JSON.stringify(message);

        this.wss.clients.forEach(ws => {
            ws.send(messageJson);
        });
    }

    forwardAllActions(ws: WebSocket) {
        for (const action of this.actions) {
            this.sendMessage(ws, {
                type: 'dispatch',
                action: action,
            });
        }
    }

    applyAction(message: DispatchAction) {
        this.actions.push(message.action as any);
        this.saveActions();
    }

    forwardAction(message: DispatchAction) {
        this.broadcastMessage(message);
    }

    sendError(ws: WebSocket, message: string) {
        ws.send(JSON.stringify({
            type: 'error',
            message: message
        }));
    }
}
