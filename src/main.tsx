import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.js'
import { BrowserRouter } from 'react-router'

// on enveloppe le composant App avec le BrowserRouter
// il permet d'activer le routing de l'application
createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)