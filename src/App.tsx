import { NotesLayout } from './features/notes/layouts/NotesLayout.js';
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom'
import RegisterLayout from './features/auth/layouts/RegisterLayout.js';
import LoginLayout from './features/auth/layouts/LoginLayout.js';

// composant racine de l'app
// gère le routing
function App() {
  return (
    <Routes>

      {/*
        routes d'authentification
      */}
      <Route path="/auth/login" element={<LoginLayout />} />
      <Route path="/auth/register" element={<RegisterLayout />} />

      {/*
        route principale de l'app
        /app correspond à l'interface de gestion de notes
      */}
      <Route path="/app" element={<NotesLayout />} />

      {/* 
        route racine (/)
        on redrige automatiquement vers /app
      */}
      <Route path="/" element={<Navigate to="/app" replace />}/>

        {/*
        Si l'utilisateur tape une URL inconnue, on le redirige vers /app.
      */}
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  )
}

export default App;