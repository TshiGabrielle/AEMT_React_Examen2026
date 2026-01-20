import { NotesLayout } from './features/notes/layouts/NotesLayout.js'
import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import RegisterLayout from './features/auth/layouts/RegisterLayout.js'
import LoginLayout from './features/auth/layouts/LoginLayout.js'

// Composant racine de l'app
// Gère le routing
function App() {
  return (
    <Routes>

      {/* Routes d'authentification */}
      <Route path="/auth/login" element={<LoginLayout />} />
      <Route path="/auth/register" element={<RegisterLayout />} />

      {/* Application principale */}
      <Route path="/app" element={<NotesLayout />} />

      {/* Par défaut, on arrive sur le login */}
      <Route path="/" element={<Navigate to="/auth/login" replace />} />

      {/* Toute URL inconnue renvoie vers le login */}
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  )
}

export default App