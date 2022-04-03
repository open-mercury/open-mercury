import { ChangeEvent, useState } from 'react';

import './App.css';
import Client from './Client';

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

function App() {
    const [enabled, setEnabled] = useState(false);
    const [frequency, setFrequency] = useState(125);
    const [shieldLevel, setShieldLevel] = useState(0.5);

    function toggleEnabled() {
        setEnabled(!enabled);
    }

    function updateFrequency(event: ChangeEvent<HTMLInputElement>) {
        setFrequency(event.currentTarget.valueAsNumber);
    }

    function updateShieldLevel(event: ChangeEvent<HTMLInputElement>) {
        setShieldLevel(event.currentTarget.valueAsNumber);
    }

    return (
        <div>
            <div className="ship-container">
                <Ship shieldLevel={enabled ? shieldLevel : 0} />
            </div>
            <div className="shield-controls">
                <p>
                    <button onClick={toggleEnabled}>{enabled ? "Deactivate" : "Activate"}</button>
                </p>

                <p>
                    <label htmlFor="range">Frequency</label>
                    <input id="frequency" name="range" min={50} max={200} type="range" onChange={updateFrequency} />
                    {frequency} Value MHz
                </p>

                <p>
                    <label htmlFor="range">Shield Level</label>
                    <input id="shield-level" name="range" min={0} max={1} step={0.01} type="range" onChange={updateShieldLevel} />
                    {Math.round(shieldLevel*100)}%
                </p>
            </div>
        </div>
    );
}

export default App;
