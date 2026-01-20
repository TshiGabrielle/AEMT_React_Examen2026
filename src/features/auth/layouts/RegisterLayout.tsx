// layout pour la page d'inscription
import RegisterForm from '../components/RegisterForm.js'

export default function RegisterLayout() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Register</h1>
      <RegisterForm />
      <p>
        Déjà un compte ? <a href="/auth/login">Se connecter</a>
      </p>
    </div>
  )
}
