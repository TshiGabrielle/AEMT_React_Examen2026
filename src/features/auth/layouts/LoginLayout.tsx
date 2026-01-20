import LoginForm from '../components/LoginForm.js'
import '../auth.css'
import ghost from '../../../assets/ghost.png'

// layout de la page de connexion
export default function LoginLayout() {
  return (
    <div className="auth-page">

        {/* élément décoratif (fantôme) */}
        <img src={ghost} className="auth-ghost" alt="f" />

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
