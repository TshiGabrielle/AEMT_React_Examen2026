import { useState } from 'react'

// Formulaire d'inscription.
// Même principe que LoginForm, mais pour créer un compte.
export default function RegisterForm() {

  const [pseudo, setPseudo] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Petite vérification locale basique
    if (password !== confirmPassword) {
      alert('Les mots de passe ne correspondent pas.')
      return
    }

    // Pour l'instant, on affiche juste les valeurs.
    // L'appel API viendra plus tard.
    console.log('Register:', { pseudo, password })
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

      {/* Bouton de soumission */}
      <div>
        <button type="submit">S'inscrire</button>
      </div>

    </form>
  )
}
