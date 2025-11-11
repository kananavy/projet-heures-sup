import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour les requêtes
api.interceptors.request.use(
  (config) => {
    // Ajouter token d'authentification si nécessaire
    // const token = localStorage.getItem('auth_token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API] Erreur de requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response) => {
    console.log(`[API] ✓ ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('[API] Erreur de réponse:', error);
    
    // Gestion globale des erreurs
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Token expiré ou non autorisé
          localStorage.removeItem('auth_token');
          // Rediriger vers login si nécessaire
          break;
        case 403:
          console.error('Accès refusé');
          break;
        case 404:
          console.error('Ressource non trouvée');
          break;
        case 500:
          console.error('Erreur serveur');
          break;
        default:
          console.error(`Erreur ${status}:`, data?.message || 'Erreur inconnue');
      }
    } else if (error.request) {
      console.error('Pas de réponse du serveur');
    } else {
      console.error('Erreur de configuration:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;