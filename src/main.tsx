// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import './index.css';
import { store } from './app/store'; // Adjust path if needed

const isDev = import.meta.env.MODE === 'development';

ReactDOM.createRoot(document.getElementById('root')!).render(
  isDev ? (
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>
  ) : (
    <App />
  )
);