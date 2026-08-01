import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';
import App from './App';
import { installGlobalImageFallback } from './services/imageFallback';
import { HelmetProvider } from 'react-helmet-async';
const rootElement = document.getElementById('root');
installGlobalImageFallback(rootElement);

ReactDOM.createRoot(rootElement).render(
  <HelmetProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </HelmetProvider>
);
