import React from 'react';
import './App.css';
import Layout from './containers/common/Layout'
import { Home } from './containers/index'

function App() {
  return (
    <div className="App">
        <Layout>
          <Home/>
        </Layout>
    </div>
  );
}

export default App;
