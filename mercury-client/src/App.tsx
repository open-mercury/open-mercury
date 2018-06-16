import * as React from 'react';
import './App.css';
import Client from './Client';

import shipShield from './ship-shield.png';
import ship from './ship.png';

/* tslint:disable:max-classes-per-file */
/* tslint:disable:no-console */

// var state = {
//   shields: {
//     enabled: false,
//     strength: 0
//   }
// }

const client = new Client("ws://localhost:8080");
console.log(client.state);


interface IShipProps {
  shieldLevel: number;
}

interface IAppState {
  enabled: boolean;
  frequency: number;
  shieldLevel: number;
}

class Ship extends React.Component<IShipProps> {
  public render() {
    return (
      <div className="ship">
        <img src={ship}/>
        <img className="shield-overlay" src={shipShield} style={{opacity: this.props.shieldLevel}}/>
      </div>
    );
  }
}

class App extends React.Component<any, IAppState> {
  constructor(props: any) {
    super(props);

    this.state = {
      enabled: false,
      frequency: 125,
      shieldLevel: 0.5
    };

    this.updateFrequency = this.updateFrequency.bind(this);
    this.toggleEnabled = this.toggleEnabled.bind(this);
  }

  public render() {
    return (
      <div>
        <div className="ship-container">
          <Ship shieldLevel={this.state.enabled ? this.state.shieldLevel : 0}/>
        </div>
        <div className="shield-controls">
            <p>
              <button onClick={this.toggleEnabled}>{this.state.enabled ? "Deactive" : "Activate"}</button>
            </p>

            <p>
              Shield Level: {this.state.enabled ? this.state.shieldLevel : "Disabled"}

            </p>
            <p>
              <label htmlFor="range">Frequency</label>
              <input id="frequency" name="range" min={50} max={200} type="range" onChange={this.updateFrequency}/>
              {this.state.frequency} Value MHz
            </p>
        </div>
      </div>
    );
  }

  private toggleEnabled() {
    console.log('activate');
    this.setState({
      ...this.state,
      enabled: !this.state.enabled
    });
  }

  private updateFrequency() {
    const element = document.querySelector('#frequency');

    if (!(element instanceof HTMLInputElement)) {
      return;
    }

    this.setState({
      ...this.state,
      frequency: parseInt(element.value, 10)
    });
  }
}

export default App;
