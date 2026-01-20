// layout de la page de connexion
import LoginForm from '../components/LoginForm.js'

export default function LoginLayout() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Login</h1>
      <LoginForm />
      <p>
        Pas encore de compte ? <a href="/auth/register">S'inscrire</a>
      </p>
    </div>
  )
}
