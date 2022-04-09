import ShieldsCard from './cards/shields/Shields';
import { reduceShieldsState } from './database/shields/ShieldsState';

import Client from './networking/Client';

import './App.css';

const client = new Client("ws://localhost:8080", {
    'shields': [
        reduceShieldsState,
    ],
});

function App() {
    return (
        <div>
            <ShieldsCard client={client} />
        </div>
    );
}

export default App;
