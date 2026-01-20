import RegisterForm from '../components/RegisterForm.js'
import '../auth.css'
import ghost from '../../../assets/ghost.png'

// layout pour la page d'inscription
export default function RegisterLayout() {
  return (
    <div className="auth-page">

                {/* élément décoratif (fantôme) */}
        <img src={ghost} className="auth-ghost" alt="f" />
      <div className="auth-card">
        <h1>Inscription</h1>

        <RegisterForm />

        <p className="auth-switch">
          Déjà un compte ? <a href="/auth/login">Se connecter</a>
        </p>
      </div>
    </div>
  )
}