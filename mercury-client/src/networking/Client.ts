import { useEffect, useState } from 'react';
import { deepCopy } from './deepCopy';

import { makeId } from './makeId';
import { DispatchAction, Message, StartupRequest } from './Message';

export type DatabaseState = any;
export type DatabaseActionReducer<TState, TAction> = (state: TState, action: TAction) => TState | undefined;
export type DatabaseActionDispatcher<TAction> = (action: TAction) => Promise<void>;

export type ObserverCallback = (state: DatabaseState) => void;
export type ObserverCleanup = () => void;

interface ActionDispatchResolver {
    resolve(): void
    reject(): void
}

export default class Client {
    private ws: WebSocket;
    private reducers: Record<string, DatabaseActionReducer<any, any>[]> = {};

    private committedState: DatabaseState = {};
    private pendingState: DatabaseState = {};
    public immutableState: DatabaseState = {};

    private pendingActions: DispatchAction[] = [];
    private pendingActionDispatchResolvers: Record<string, ActionDispatchResolver> = {};

    private observers: Record<string, ObserverCallback> = {};

    constructor(url: string, reducers: Record<string, DatabaseActionReducer<any, any>[]>) {
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
            this.sendStartup();
        };

        this.ws.onmessage = (event) => {
            this.receiveMessage(JSON.parse(event.data) as Message);
        };

        this.reducers = reducers;

        for (const prefix in reducers) {
            this.committedState[prefix] = {};

            for (const reducer of reducers[prefix]) {
                const ret = reducer(this.committedState[prefix], null);
                if (ret) {
                    this.committedState[prefix] = ret;
                }
            }
        }

        this.pendingState = deepCopy(this.committedState);
        this.immutableState = deepCopy(this.pendingState);
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

    public dispatchAction(action: any): Promise<void> {
        this.pendingActions.push(action);
        this.reapplyPendingActions();
        this.notifyObserversOfStateChange();

        return new Promise<void>((resolve, reject) => {
            const id = makeId();

            this.send({
                type: 'dispatch',
                id,
                action,
            } as DispatchAction);

            this.pendingActionDispatchResolvers[id] = {resolve, reject};
        });
    }

    private receiveMessage(message: Message) {
        console.log('received message', message);

        switch (message.type) {
            case 'dispatch':
                this.applyAction(message);
                this.notifyObserversOfStateChange();

                this.pendingActionDispatchResolvers[message.id]?.resolve();

                break;

            case 'startup':
            default:
                console.error("received unexpected message type:", message.type)
                break;
        }
    }

    private send(message: Message) {
        this.ws.send(JSON.stringify(message));
    }

    private applyAction(message: DispatchAction) {
        this.pendingActions = this.pendingActions.filter(a => a.id !== message.id);

        for (const prefix in this.reducers) {
            for (const reducer of this.reducers[prefix]) {
                reducer(this.committedState[prefix], message.action);
            }
        }

        this.reapplyPendingActions();
    }

    private reapplyPendingActions() {
        this.pendingState = deepCopy(this.committedState);

        for (const pendingAction of this.pendingActions) {
            for (const prefix in this.reducers) {
                for (const reducer of this.reducers[prefix]) {
                    reducer(this.pendingState[prefix], pendingAction);
                }
            }
        }

        this.immutableState = deepCopy(this.pendingState);
    }

    private notifyObserversOfStateChange() {
        for (const observer of Object.values(this.observers)) {
            try {
                observer(this.immutableState);
            }
            catch (error) {
                console.error(`encountered error while notifying observer of state change:`, error)
            }
        }
    }
}

export function useDatabaseState<TState, TAction>(client: Client, prefix: string): [TState, DatabaseActionDispatcher<TAction>] {
    const [state, setState] = useState(client.immutableState[prefix]);

    useEffect(() => {
        return client.addObserver(newState => {
            setState(newState[prefix]);
        });
    }, [client]);

    return [state, action => client.dispatchAction(action)];
}
