import { useState } from 'react'
import { AuthService } from '../../../services/AuthService.js'

// formulaire de connexion
export default function LoginForm() {

  // états locaux pour stocker les valeurs saisies
  const [pseudo, setPseudo] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  // fct appelée lors de la soumission du formulaire
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try {
      // appel au backend pour tenter une connexion
      const result = await AuthService.login(pseudo, password)

      // Pour l'instant, on se contente d'afficher le résultat.
      // Plus tard, on stockera le userId et on redirigera vers /app.
      console.log('Connecté ! userId =', result.userId)

    } catch (e) {
      // en cas d'erreur
      setError('Pseudo ou mot de passe incorrect.')
    }
  }

  return (
    <form onSubmit={handleSubmit}>

      {/* Champ pseudo */}
      <div>
        <label>Pseudo</label><br />
        <input
          type="text"
          value={pseudo}
          onChange={e => setPseudo(e.target.value)}
          placeholder="Votre pseudo"
        />
      </div>

      {/* Champ mot de passe */}
      <div>
        <label>Mot de passe</label><br />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Votre mot de passe"
        />
      </div>

      {/* msg d'erreur */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* btn de soumission */}
      <div>
        <button type="submit">Se connecter</button>
      </div>

    </form>
  )
}