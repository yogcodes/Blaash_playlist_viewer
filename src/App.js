import React from 'react';
import Header from './Components/Header';
import Sidebar from './Components/Sidebar';
import PlaylistManager from './Components/PlaylistManager';
import './App.css';

const App = () => (
  <div className="app">
    <Header/>
    <div className="main-content">
      <Sidebar />
      <PlaylistManager />
    </div>
  </div>
);

export default App;
