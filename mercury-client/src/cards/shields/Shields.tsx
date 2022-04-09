import { ChangeEvent } from 'react';

import { setShieldsEnabled, setShieldsFrequency, setShieldsLevel, ShieldsAction } from '../../database/shields/ShieldsActions';
import { ShieldsState } from '../../database/shields/ShieldsState';
import Client, { useDatabaseState } from '../../networking/Client';

import shipShield from './ship-shield.png';
import ship from './ship.png';
import './Shields.css';

interface ShipProps {
    shieldLevel: number;
}

function Ship({shieldLevel}: ShipProps) {
    return (
        <div className="ship">
            <img src={ship} />
            <img className="shield-overlay" src={shipShield} style={{opacity: shieldLevel}} />
        </div>
    );
}

interface ShieldsCardProps {
    client: Client
}

export default function ShieldsCard({client}: ShieldsCardProps) {
    const [{enabled, frequency, level}, dispatchAction] = useDatabaseState<ShieldsState, ShieldsAction>(client, 'shields');

    function toggleEnabled() {
        dispatchAction(setShieldsEnabled(!enabled));
    }

    function updateFrequency(event: ChangeEvent<HTMLInputElement>) {
        const value = event.currentTarget.valueAsNumber;
        dispatchAction(setShieldsFrequency(value));
    }

    async function updateLevel(event: ChangeEvent<HTMLInputElement>) {
        const value = event.currentTarget.valueAsNumber;
        dispatchAction(setShieldsLevel(value));
    }

    return (
        <div>
            <div className="ship-container">
                <Ship shieldLevel={enabled ? level : 0} />
            </div>
            <div className="shield-controls">
                <p>
                    <button onClick={toggleEnabled}>{enabled ? "Deactivate" : "Activate"}</button>
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
