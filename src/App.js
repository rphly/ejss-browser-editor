import React from 'react';
import './App.css';
import Frame from './containers/skeleton/Frame'
import { Flow } from './containers/index'

function App() {
  return (
    <div className="App">
        <Frame>
          <Flow/>
        </Frame>
    </div>
  );
}

export default App;
