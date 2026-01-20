// service responsable de la communication avec le backend pour l'authentification

const url = 'http://localhost:8080/api/auth'
const key = 'userId'

// réponse attendue depuis le backend
export interface AuthResponse {
    success: boolean
    message: string
    userId: number | null
}

export class AuthService {
    // envoie une requête au backend pour se connecter
    static async login(pseudo: string, password: string): Promise<AuthResponse> {
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
    static async register(pseudo: string, password: string): Promise<AuthResponse> {
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

    // sauvegarde l'utilisateur connecté dans le navigateur
    static saveUser(userId: number) {
        localStorage.setItem(key, userId.toString())
    }

    // récupère l'utilisateur connecté (ou null s'il n'y en a pas)
    static getUser(): number | null {
        const value = localStorage.getItem(key)

        if (value === null) {
            // aucun utilisateur enregistré
            return null
        }

        // on convertit la chaîne stockée en nombre
        return Number(value)
    }

    // supprime l'utilisateur connecté (déconnexion)
    static logout() {
        localStorage.removeItem(key)
    }

    // indique si un utilisateur est connecté
    static isLoggedIn(): boolean {
        return this.getUser() !== null
    }
}