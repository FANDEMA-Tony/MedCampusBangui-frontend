// Constantes de l'application

// Rôles utilisateurs
export const ROLES = {
  ADMIN: 'admin',
  ENSEIGNANT: 'enseignant',
  ETUDIANT: 'etudiant',
};

// Types de ressources
export const TYPES_RESSOURCES = {
  COURS: 'cours',
  LIVRE: 'livre',
  VIDEO: 'video',
  ARTICLE: 'article',
  AUTRE: 'autre',
};

// Niveaux d'études
export const NIVEAUX = {
  L1: 'L1',
  L2: 'L2',
  L3: 'L3',
  M1: 'M1',
  M2: 'M2',
  DOCTORAT: 'doctorat',
  FORMATION_CONTINUE: 'formation_continue',
};

// Niveaux de gravité (données sanitaires)
export const GRAVITES = {
  LEGER: 'leger',
  MODERE: 'modere',
  GRAVE: 'grave',
  CRITIQUE: 'critique',
};

// Statuts (données sanitaires)
export const STATUTS = {
  EN_COURS: 'en_cours',
  GUERISON: 'guerison',
  DECEDE: 'decede',
  SUIVI_PERDU: 'suivi_perdu',
};

// Tranches d'âge
export const TRANCHES_AGE = [
  '0-5',
  '6-12',
  '13-18',
  '19-35',
  '36-60',
  '60+',
];

// Messages d'erreur
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur de connexion au serveur',
  UNAUTHORIZED: 'Vous devez être connecté pour accéder à cette page',
  FORBIDDEN: 'Vous n\'avez pas les permissions nécessaires',
  NOT_FOUND: 'Ressource introuvable',
  SERVER_ERROR: 'Une erreur serveur est survenue',
};

// Messages de succès
export const SUCCESS_MESSAGES = {
  LOGIN: 'Connexion réussie',
  LOGOUT: 'Déconnexion réussie',
  CREATED: 'Élément créé avec succès',
  UPDATED: 'Élément mis à jour avec succès',
  DELETED: 'Élément supprimé avec succès',
};