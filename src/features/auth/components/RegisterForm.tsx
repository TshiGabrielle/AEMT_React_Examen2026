import { useState } from 'react'
import { AuthService } from '../../../services/AuthService.js'
import { useNavigate } from 'react-router-dom'

// formulaire d'inscription
export default function RegisterForm() {

  const [pseudo, setPseudo] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  // permet de naviguer vers une autre route
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // vérification 
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    try {
      // appel au backend pour créer le compte
      const result = await AuthService.register(pseudo, password)

      if (result.success && result.userId !== null) {
        // on connecte automatiquement l'utilisateur
        AuthService.saveUser(result.userId)

        // redirection vers l'application
        navigate('/app')
      } else {
        setError(result.message)
      }
     // console.log('Compte créé ! userId =', result)
    } catch (e) {
      setError("Impossible de créer le compte.")
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
          placeholder="Choisissez un pseudo"
        />
      </div>

      {/* Champ mot de passe */}
      <div>
        <label>Mot de passe</label><br />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Mot de passe"
        />
      </div>

      {/* Confirmation du mot de passe */}
      <div>
        <label>Confirmer le mot de passe</label><br />
        <input
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          placeholder="Confirmez le mot de passe"
        />
      </div>

      {/* msg éventuel */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* btn de soumission */}
      <div>
        <button type="submit">S'inscrire</button>
      </div>

    </form>
  )
}