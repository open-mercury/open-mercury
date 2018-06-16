function deepUpdate(oldState: any, newState: any): any
{
    if (oldState instanceof Array && newState instanceof Array) {
        return deepUpdateArray(oldState, newState);
    }
    else if (oldState instanceof Object && newState instanceof Object) {
        return deepUpdateObject(oldState, newState);
    }
    else {
        return newState;
    }
}

function deepUpdateObject(oldState: object, newState: object): object {
    const copy = {};
    const keys = new Set([...Object.keys(oldState), ...Object.keys(newState)]);
    for (const key of keys) {
        const value = deepUpdate(oldState[key], newState[key]);
        if (value !== undefined) {
            copy[key] = value;
        }
    }

    for (const key of keys) {
        if (copy[key] !== oldState[key]) {
            return copy;
        }
    }

    return newState;
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

function buildDiff(oldState: any, newState: any) {
    // TODO: Doesn't handle deleted keys or null values
    if (newState instanceof Object) {
        const diff = {};
        for (const key of Object.keys(newState)) {
            diff[key] = buildDiff(oldState[key], newState[key]);
        }

        for (const key of Object.keys(diff)) {
            if (diff[key] !== undefined) {
                return diff;
            }
        }

        return undefined;
    }
    else if (oldState !== newState) {
        return newState;
    }
    else {
        return undefined;
    }
}

export default class Client {

    public state: any | null = null;
    private ws: WebSocket;
    private serverState = {};

    constructor(url: string) {
        this.ws = new WebSocket(url);

        this.ws.onopen = (event) => {
            this.requestState();

            // Testing
            this.state = { "bob's": "your uncle" };
            this.sendState();
        };

        this.ws.onmessage = (event) => {
            this.receiveMessage(JSON.parse(event.data));
        };
    }

    public requestState() {
        this.ws.send(JSON.stringify({
            type: "state"
        }));
    }

    public sendState() {
        this.ws.send(JSON.stringify({
            type: "set",
            data: buildDiff(this.serverState, this.state)
        }));
    }

    private receiveMessage(message: any) {
        switch (message.type) {
        case "state":
            this.state = deepUpdate(this.state, message.state);
            this.serverState = this.state;
            console.log(this.state);
            break;
        default:
            console.log(message);
            break;
        }
    }

}
