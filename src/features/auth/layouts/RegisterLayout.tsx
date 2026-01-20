import RegisterForm from '../components/RegisterForm.js'
import '../auth.css'

// layout pour la page d'inscription
export default function RegisterLayout() {
  return (
    <div className="auth-page">
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