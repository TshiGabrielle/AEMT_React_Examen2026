import LoginForm from '../components/LoginForm.js'
import '../auth.css'

// layout de la page de connexion
export default function LoginLayout() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Connexion</h1>

        <LoginForm />

        <p className="auth-switch">
          Pas encore de compte ? <a href="/auth/register">S'inscrire</a>
        </p>
      </div>
    </div>
  )
}
