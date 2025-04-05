import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './Components/App.jsx'
import '../src/styles/style.css';

// Create the root for React 18
const root = ReactDOM.createRoot(document.getElementById('root'));

// Initial render
root.render(<App />);

// Enable HMR for React components
if (module.hot) {
  module.hot.accept();
}
