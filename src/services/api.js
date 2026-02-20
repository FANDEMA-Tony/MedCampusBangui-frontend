import axios from 'axios';

// Configuration de base de l'API
const API_URL = 'http://127.0.0.1:8000/api';

// Instance axios configurée
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ✅ AUTHENTIFICATION
export const authService = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
  logout: () => api.post('/logout'),
  getMe: () => api.get('/me'),
};

// ✅ ÉTUDIANTS
export const etudiantService = {
  getAll: () => api.get('/etudiants'),
  getMesEtudiants: () => api.get('/mes-etudiants'),
  getOne: (id) => api.get(`/etudiants/${id}`),
  create: (data) => api.post('/etudiants', data),
  update: (id, data) => api.put(`/etudiants/${id}`, data),
  delete: (id) => api.delete(`/etudiants/${id}`),
  getNotes: (id) => api.get(`/etudiants/${id}/notes`),
};

// ✅ ENSEIGNANTS
export const enseignantService = {
  getAll: () => api.get('/enseignants'),
  getOne: (id) => api.get(`/enseignants/${id}`),
  create: (data) => api.post('/enseignants', data),
  update: (id, data) => api.put(`/enseignants/${id}`, data),
  delete: (id) => api.delete(`/enseignants/${id}`),
  getCours: (id) => api.get(`/enseignants/${id}/cours`),
};

// ✅ COURS
export const coursService = {
  getAll: () => api.get('/cours'),
  getMesCours: () => api.get('/mes-cours'),
  getOne: (id) => api.get(`/cours/${id}`),
  create: (data) => api.post('/cours', data),
  update: (id, data) => api.put(`/cours/${id}`, data),
  delete: (id) => api.delete(`/cours/${id}`),
  getNotes: (id) => api.get(`/cours/${id}/notes`),
};

// ✅ NOTES
export const noteService = {
  getAll: () => api.get('/notes'),
  
  getMesNotes: () => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (user?.role === 'etudiant') {
      return api.get('/mes-notes-etudiant');
    }
    
    if (user?.role === 'enseignant') {
      return api.get('/mes-notes');
    }
    
    return api.get('/notes');
  },
  
  getOne: (id) => api.get(`/notes/${id}`),
  create: (data) => api.post('/notes', data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
};

// ✅ MESSAGERIE
export const messageService = {
  // Messages privés
  getBoiteReception: () => api.get('/messages/boite-reception'),
  getBoiteEnvoi: () => api.get('/messages/boite-envoi'),
  getConversation: (userId) => api.get(`/messages/conversation/${userId}`),
  getNonLus: () => api.get('/messages/non-lus'),
  
  // Annonces
  getAnnonces: () => api.get('/messages/annonces'),
  
  // Forum
  getForum: (page = 1) => api.get('/messages/forum', { params: { page } }),
  
  // CRUD
  getOne: (id) => api.get(`/messages/${id}`),
  send: (data) => api.post('/messages', data),
  delete: (id) => api.delete(`/messages/${id}`),
  
  // Épingler
  toggleEpingle: (id) => api.post(`/messages/${id}/toggle-epingle`),

  // 🆕 AJOUTÉ
  like: (id) => api.post(`/messages/${id}/like`),

  // 🆕 RÉPONSES
  getReponses: (id) => api.get(`/messages/${id}/reponses`),
  repondre: (id, data) => api.post(`/messages/${id}/repondre`, data),
};

// ✅ RESSOURCES MÉDICALES (UNE SEULE FOIS)
export const ressourceService = {
  getAll: (params) => api.get('/ressources', { params }),
  getOne: (id) => api.get(`/ressources/${id}`),
  create: (formData) => api.post('/ressources', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => api.put(`/ressources/${id}`, data),
  delete: (id) => api.delete(`/ressources/${id}`),
  download: (id) => api.get(`/ressources/${id}/telecharger`, {
    responseType: 'blob'
  }),
};

// ✅ DONNÉES SANITAIRES
export const donneeSanitaireService = {
  getAll: (params) => api.get('/donnees-sanitaires', { params }),
  getOne: (id) => api.get(`/donnees-sanitaires/${id}`),
  create: (data) => api.post('/donnees-sanitaires', data),
  update: (id, data) => api.put(`/donnees-sanitaires/${id}`, data),
  delete: (id) => api.delete(`/donnees-sanitaires/${id}`),
  getStatistiques: () => api.get('/donnees-sanitaires/statistiques'),
  // 🆕 RECHERCHE PAR CODE
  rechercherParCode: (code) => api.get('/donnees-sanitaires/rechercher-code', { params: { code } }),
};

export default api;