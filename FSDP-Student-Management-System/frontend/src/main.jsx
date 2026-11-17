import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Providers } from './app/providers.jsx';
import App from './app/App.jsx';
import './shared/styles/global.css';
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Providers>
        <App />
      </Providers>
    </BrowserRouter>
  </React.StrictMode>,
);
