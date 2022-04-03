import { useEffect, useState } from 'react';
import { Message, StartupRequest, StateChange } from './messages';

export function deepUpdate(oldState: any, newState: any): any {
    if (oldState instanceof Array && newState instanceof Array) {
        return deepUpdateArray(oldState, newState);
    }
    else if (oldState instanceof Object && newState instanceof Object) {
        return deepUpdateObject(oldState, newState);
    }
    else {
        return newState ?? oldState;
    }
}

function deepUpdateObject(oldState: any, newState: any): object {
    const copy: any = {};
    const keys = new Set([...Object.keys(oldState), ...Object.keys(newState)]);
    const keysArray = Array.from(keys.values());

    for (const key of keysArray) {
        copy[key] = deepUpdate(oldState[key], newState[key]);
    }

    return copy;
}

function deepUpdateArray(oldState: any[], newState: any[]): any[] {

    const copy: any[] = [];
    for (let i = 0; i < newState.length; ++i) {
        copy[i] = deepUpdate(oldState[i], newState[i]);
    }

    if (copy.length !== oldState.length) {
        return copy;
    }
    for (let i = 0; i < newState.length; ++i) {
        if (copy[i] !== oldState[i]) {
            return copy;
        }
    }

    return newState;
}

function makeId() {
    return Math.floor(Math.random() * 1000000).toString(10);
}

export type DatabaseState = any;
export type DatabaseStateChangeDispatcher = (changes: any) => Promise<void>;

export type ObserverCallback = (state: DatabaseState) => void;
export type ObserverCleanup = () => void;

interface ChangeResolver {
    resolve(): void
    reject(): void
}

export default class Client {

    private ws: WebSocket;

    public state: DatabaseState = {};

    private pendingChangeResolvers: Record<string, ChangeResolver> = {};
    private observers: Record<string, ObserverCallback> = {};

    constructor(url: string) {
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
            this.sendStartup();
        };

        this.ws.onmessage = (event) => {
            this.receiveMessage(JSON.parse(event.data) as Message);
        };
    }

    public addObserver(observer: (state: DatabaseState) => void): ObserverCleanup {
        const id = makeId();
        this.observers[id] = observer;

        return () => {
            delete this.observers[id];
        }
    }

    public sendStartup() {
        this.send({
            type: 'startup',
        } as StartupRequest);
    }

    public sendChange(data: any): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const id = makeId();

            this.send({
                type: 'change',
                id: id,
                data: data,
            } as StateChange);

            this.pendingChangeResolvers[id] = {resolve, reject};
        });
    }

    private send(message: Message) {
        this.ws.send(JSON.stringify(message));
    }

    private receiveMessage(message: Message) {
        console.log('received message', message);

        switch (message.type) {
            case 'state':
                this.state = message.data;
                this.notifyObserversOfStateChange();
                break;

            case 'change':
                this.state = deepUpdate(this.state, message.data);
                this.notifyObserversOfStateChange();

                const promise = this.pendingChangeResolvers[message.id];
                promise?.resolve();

                break;

            case 'startup':
            default:
                console.error("received unexpected message type:", message.type)
                break;
        }
    }

    private notifyObserversOfStateChange() {
        for (const observer of Object.values(this.observers)) {
            try {
                observer(this.state);
            }
            catch (error) {
                console.error(`encountered error while notifying observer of state change:`, error)
            }
        }
    }
}

export function useDatabaseState(client: Client): [DatabaseState, DatabaseStateChangeDispatcher] {
    const [state, setState] = useState(client.state);

    useEffect(() => {
        return client.addObserver(newState => {
            setState(newState);
        });
    }, []);

    return [state, data => client.sendChange(data)];
}
