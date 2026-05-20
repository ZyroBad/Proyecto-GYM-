import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles.css';
import { StorageProvider } from './context/StorageProvider.jsx';
import { ThemeProvider } from './context/ThemeProvider.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <StorageProvider>
        <App />
      </StorageProvider>
    </ThemeProvider>
  </React.StrictMode>
);
