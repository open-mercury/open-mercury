import { ChangeEvent, useState } from 'react';

import './App.css';
import Client, { deepUpdate, useDatabaseState } from './Client';
import shipShield from './ship-shield.png';
import ship from './ship.png';

const client = new Client("ws://localhost:8080");
console.log(client.state);

interface IShipProps {
  shieldLevel: number;
}

function Ship({shieldLevel}: IShipProps) {
    return (
        <div className="ship">
            <img src={ship} />
            <img className="shield-overlay" src={shipShield} style={{opacity: shieldLevel}} />
        </div>
    );
}

function test() {
    const old = {
        hi: 'there',
        shields: {
            enabled: true,
            level: 0.5,
        },
    };

    const update = {
        shields: {
            level: 0.2,
        },
    };

    const newState = deepUpdate(old, update);
    return newState;
}

function App() {
    const [state, dispatchStateChange] = useDatabaseState(client);

    const [levelOverride, setLevelOverride] = useState<number>();
    const [frequencyOverride, setFrequencyOverride] = useState<number>();

    const enabled = state.shields?.enabled ?? false;
    const frequency = frequencyOverride ?? (state.shields?.frequency as number | undefined) ?? 0;
    const level = levelOverride ?? (state.shields?.level as number | undefined) ?? 0;

    console.log(state);

    function toggleEnabled() {
        dispatchStateChange({
            shields: {
                enabled: !enabled,
            },
        });
    }

    function updateFrequency(event: ChangeEvent<HTMLInputElement>) {
        const value = event.currentTarget.valueAsNumber;
        setFrequencyOverride(value);

        dispatchStateChange({
            shields: {
                frequency: value,
            },
        });
    }

    async function updateLevel(event: ChangeEvent<HTMLInputElement>) {
        const value = event.currentTarget.valueAsNumber;
        setLevelOverride(value);

        await dispatchStateChange({
            shields: {
                level: value,
            },
        });

        setLevelOverride(undefined);
    }

    return (
        <div>
            <div className="ship-container">
                <Ship shieldLevel={enabled ? level : 0} />
            </div>
            <div className="shield-controls">
                <p>
                    <button onClick={toggleEnabled}>{enabled ? "Deactivate" : "Activate"}</button>
                    <button onClick={test}>Test</button>
                </p>

                <p>
                    <label htmlFor="range">Frequency</label>
                    <input id="frequency" name="range" min={50} max={200} type="range" value={frequency} onChange={updateFrequency} />
                    {frequency} Value MHz
                </p>

                <p>
                    <label htmlFor="range">Shield Level</label>
                    <input id="shield-level" name="range" min={0} max={1} step={0.01} type="range" value={level} onChange={updateLevel} />
                    {Math.round(level*100)}%
                </p>
            </div>
        </div>
    );
}

export default App;
