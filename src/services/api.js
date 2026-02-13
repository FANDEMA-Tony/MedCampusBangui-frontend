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
      // Token expiré ou invalide
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Services d'authentification
export const authService = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
  logout: () => api.post('/logout'),
  getMe: () => api.get('/me'),
};

// Services étudiants
export const etudiantService = {
  getAll: () => api.get('/etudiants'),
  getOne: (id) => api.get(`/etudiants/${id}`),
  create: (data) => api.post('/etudiants', data),
  update: (id, data) => api.put(`/etudiants/${id}`, data),
  delete: (id) => api.delete(`/etudiants/${id}`),
  getNotes: (id) => api.get(`/etudiants/${id}/notes`),
};

// Services enseignants
export const enseignantService = {
  getAll: () => api.get('/enseignants'),
  getOne: (id) => api.get(`/enseignants/${id}`),
  create: (data) => api.post('/enseignants', data),
  update: (id, data) => api.put(`/enseignants/${id}`, data),
  delete: (id) => api.delete(`/enseignants/${id}`),
  getCours: (id) => api.get(`/enseignants/${id}/cours`),
};

// Services cours
export const coursService = {
  getAll: () => api.get('/cours'),
  getOne: (id) => api.get(`/cours/${id}`),
  create: (data) => api.post('/cours', data),
  update: (id, data) => api.put(`/cours/${id}`, data),
  delete: (id) => api.delete(`/cours/${id}`),
  getNotes: (id) => api.get(`/cours/${id}/notes`),
};

// Services notes
export const noteService = {
  getAll: () => api.get('/notes'),
  getOne: (id) => api.get(`/notes/${id}`),
  create: (data) => api.post('/notes', data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
};

// Services ressources
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

// Services données sanitaires
export const donneeSanitaireService = {
  getAll: (params) => api.get('/donnees-sanitaires', { params }),
  getOne: (id) => api.get(`/donnees-sanitaires/${id}`),
  create: (data) => api.post('/donnees-sanitaires', data),
  update: (id, data) => api.put(`/donnees-sanitaires/${id}`, data),
  delete: (id) => api.delete(`/donnees-sanitaires/${id}`),
  getStatistiques: () => api.get('/donnees-sanitaires/statistiques'),
};

// Services messages
export const messageService = {
  getBoiteReception: () => api.get('/messages/boite-reception'),
  getBoiteEnvoi: () => api.get('/messages/boite-envoi'),
  getConversation: (userId) => api.get(`/messages/conversation/${userId}`),
  getNonLus: () => api.get('/messages/non-lus'),
  getOne: (id) => api.get(`/messages/${id}`),
  send: (data) => api.post('/messages', data),
  delete: (id) => api.delete(`/messages/${id}`),
};

export default api;