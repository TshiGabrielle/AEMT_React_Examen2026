// service responsable de la communication avec le backend pour l'authentification

const url = 'http://localhost:8080/api/auth'

// réponse attendue depuis le backend
// ici on récupère juste l'id de l'utilisateur
export interface AuthResponse {
    userId: number
}

export class AuthService {
    // envoie une requête au backend pour se connecter
    async login(pseudo: string, password: string): Promise<AuthResponse> {
        const response = await fetch(`${url}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pseudo, password })
        })
        
        // si le serveur répond par un code d'erreur, on lève une exception
        // pour que le composant react puisse afficher un msg d'erreur
        if (!response.ok) {
            throw new Error('Erreur lors de la connexion')
        }
        
        // convertir la réponse json en objet js
        return await response.json()
    }

    // envoie une requête au backend pour s'inscrire
    async register(pseudo: string, password: string): Promise<AuthResponse> {
        const response = await fetch(`${url}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pseudo, password })
        })

        if (!response.ok) {
            throw new Error("Erreur lors de l'inscription")
        }
        return await response.json()
    }
}