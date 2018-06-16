const fs = require('fs');
const deepmerge = require('deepmerge');

const currentState = {};

function loadState(filePath) {
    try {
        const stateString = fs.readFileSync(filePath);
        const state = JSON.parse(stateString);
        return state;
    } catch (error) {
        return null;
    }
}

function saveState(filePath, state) {
    const text = JSON.stringify(state);
    fs.writeFileSync(filePath, text);
}

function applyDelta(oldState, changes) {
    return deepmerge(oldState, changes);
}


class Db {
    constructor(filePath) {
        this.filePath = filePath;
        this.state = loadState(filePath);
        if (!this.state) {
            this.state = {};
        }

        this.interval = setInterval(() => {
            this.save();
        }, 10000);
    }

    apply(change) {
        this.state = applyDelta(this.state, change);
    }

    save() {
        saveState(this.filePath, this.state);
    }
}

exports.Db = Db;

