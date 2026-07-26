import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';
import App from './App';
import { installGlobalImageFallback } from './services/imageFallback';

const rootElement = document.getElementById('root');
installGlobalImageFallback(rootElement);

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
