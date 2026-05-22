'use strict';

import React from 'react';
import { StudioShufflePlayer } from './components/StudioShufflePlayer';

const App: React.FC = () => {
  return (
    <div className="app-root">
      <StudioShufflePlayer />
      <div className="hero-overlay">
        <div className="hero-panel">
          <div className="hero-tag">Quantum‑44</div>
          <h1 className="hero-title">Teal‑Core Cinematic Engine</h1>
          <p className="hero-sub">
            Unity‑grade HDR scenes, 4K→8K upscale, 265M bitrate, live studio shuffle.
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;

