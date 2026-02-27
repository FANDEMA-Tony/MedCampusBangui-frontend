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
  getGrouped: () => api.get('/etudiants-grouped'), // 🆕 NOUVELLE MÉTHODE
  getMesEtudiants: () => api.get('/mes-etudiants'),
  getEtudiantsParCours: (idCours) => api.get(`/etudiants-par-cours/${idCours}`), // 🆕 NOUVELLE MÉTHODE
  getOne: (id) => api.get(`/etudiants/${id}`),
  create: (data) => api.post('/etudiants', data),
  update: (id, data) => api.put(`/etudiants/${id}`, data),
  delete: (id) => api.delete(`/etudiants/${id}`),
  getNotes: (id) => api.get(`/etudiants/${id}/notes`),
};

// ✅ ENSEIGNANTS
export const enseignantService = {
  getAll: () => api.get('/enseignants'),
  getGrouped: () => api.get('/enseignants-grouped'), // 🆕 NOUVELLE MÉTHODE
  getOne: (id) => api.get(`/enseignants/${id}`),
  create: (data) => api.post('/enseignants', data),
  update: (id, data) => api.put(`/enseignants/${id}`, data),
  delete: (id) => api.delete(`/enseignants/${id}`),
  getCours: (id) => api.get(`/enseignants/${id}/cours`),
};

// ✅ COURS
export const coursService = {
  getAll: () => api.get('/cours'),
  getGrouped: () => api.get('/cours-grouped'), // 🆕 NOUVELLE MÉTHODE
  getMesCours: () => api.get('/mes-cours'),
  getMesCoursEtudiant: () => api.get('/mes-cours-etudiant'), // 🆕 POUR ÉTUDIANT
  getDetailCoursEtudiant: (id) => api.get(`/mes-cours-etudiant/${id}`), // 🆕 DÉTAIL
  getOne: (id) => api.get(`/cours/${id}`),
  create: (data) => api.post('/cours', data),
  update: (id, data) => api.put(`/cours/${id}`, data),
  delete: (id) => api.delete(`/cours/${id}`),
  getNotes: (id) => api.get(`/cours/${id}/notes`),
};

// ✅ NOTES
export const noteService = {
  getAll: () => api.get('/notes'),
  getGrouped: () => api.get('/notes-grouped'), // 🆕 NOUVELLE MÉTHODE

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

  // Likes
  like: (id) => api.post(`/messages/${id}/like`),

  // Réponses
  getReponses: (id) => api.get(`/messages/${id}/reponses`),
  repondre: (id, data) => api.post(`/messages/${id}/repondre`, data),
};

// ✅ RESSOURCES MÉDICALES
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
  // 🆕 LIKE
  like: (id) => api.post(`/ressources/${id}/like`),
  // 🆕 PRÉVISUALISATION
  previsualiser: (id) => api.get(`/ressources/${id}/previsualiser`, {
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
  rechercherParCode: (code) => api.get('/donnees-sanitaires/rechercher-code', { params: { code } }),
};

// ✅ ANALYTICS
export const analyticsService = {
  getStatsAdmin: () => api.get('/analytics/admin'),
  getStatsEtudiant: () => api.get('/analytics/etudiant'),
  getStatsEnseignant: () => api.get('/analytics/enseignant'),
};

export const calendrierService = {
  getDonneesMois: (annee, mois, filiere, niveau) => api.get('/calendrier/mois', { params: { annee, mois, filiere, niveau } }),
  getAllEvenements: (params = {}) => api.get('/calendrier/evenements', { params }),
  getEvenementsEtudiant: (params = {}) => api.get('/calendrier/evenements/etudiant', { params }),
  createEvenement: (data) => api.post('/calendrier/evenements', data),
  updateEvenement: (id, data) => api.put(`/calendrier/evenements/${id}`, data),
  deleteEvenement: (id) => api.delete(`/calendrier/evenements/${id}`),
  getEmploiDuTemps: (filiere, niveau, semestre) => api.get('/calendrier/emploi-du-temps', { params: { filiere, niveau, semestre } }),
  createEmploi: (data) => api.post('/calendrier/emploi-du-temps', data),
  updateEmploi: (id, data) => api.put(`/calendrier/emploi-du-temps/${id}`, data),
  deleteEmploi: (id) => api.delete(`/calendrier/emploi-du-temps/${id}`),
  getExamens: (params = {}) => api.get('/calendrier/examens', { params }),
  createExamen: (data) => api.post('/calendrier/examens', data),
  updateExamen: (id, data) => api.put(`/calendrier/examens/${id}`, data),
  deleteExamen: (id) => api.delete(`/calendrier/examens/${id}`),
};

// ✅ RECHERCHE GLOBALE
export const searchService = {
  search: (query, type = 'tous') =>
    api.get('/search', { params: { q: query, type } }),
};

// ✅ QUIZ — Sprint 5
export const quizService = {
  // Liste
  getAll: (params = {}) => api.get('/quiz', { params }),

  // Détail
  getOne: (id) => api.get(`/quiz/${id}`),

  // CRUD
  create: (data) => api.post('/quiz', data),
  update: (id, data) => api.put(`/quiz/${id}`, data),
  delete: (id) => api.delete(`/quiz/${id}`),

  // Questions
  addQuestion: (idQuiz, data) => api.post(`/quiz/${idQuiz}/questions`, data),
  updateQuestion: (idQuestion, data) => api.put(`/quiz/questions/${idQuestion}`, data),
  deleteQuestion: (idQuestion) => api.delete(`/quiz/questions/${idQuestion}`),

  // Étudiant
  soumettre: (id, data) => api.post(`/quiz/${id}/soumettre`, data),
  mesTentatives: (id) => api.get(`/quiz/${id}/mes-tentatives`),

  // Admin/Enseignant
  stats: (id) => api.get(`/quiz/${id}/stats`),
  togglePublie: (id) => api.post(`/quiz/${id}/toggle-publie`),
};

// ✅ CERTIFICATS — Sprint 6
export const certificatService = {
  // Vérifier éligibilité de l'étudiant
  eligibilite: () => api.get('/certificats/eligibilite'),

  // Générer un certificat
  generer: (data) => api.post('/certificats/generer', data),

  // Mes certificats (étudiant)
  mesCertificats: () => api.get('/certificats'),

  // Tous les certificats (admin)
  tous: () => api.get('/certificats/tous'),

  // Signer un certificat (admin)
  signer: (id, data) => api.post(`/certificats/${id}/signer`, data),

  // Données pour téléchargement PDF
  telecharger: (id) => api.get(`/certificats/${id}/telecharger`),

  // Vérification publique (sans auth)
  verifier: (code) => axios.get(`${import.meta.env.VITE_API_URL}/certificats/verifier/${code}`),
};
export default api;