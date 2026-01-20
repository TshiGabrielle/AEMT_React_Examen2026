import { useState } from 'react'

// Formulaire de connexion.
// Ce composant ne gère que le formulaire lui-même.
// La logique d'auth réelle sera ajoutée plus tard.
export default function LoginForm() {

  // États locaux pour stocker ce que l'utilisateur tape
  const [pseudo, setPseudo] = useState('')
  const [password, setPassword] = useState('')

  // Gestion de la soumission du formulaire
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Pour l'instant, on ne fait qu'afficher les valeurs.
    // Plus tard, on appellera l'API de login ici.
    console.log('Login:', { pseudo, password })
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

      {/* Bouton de soumission */}
      <div>
        <button type="submit">Se connecter</button>
      </div>

    </form>
  )
}
