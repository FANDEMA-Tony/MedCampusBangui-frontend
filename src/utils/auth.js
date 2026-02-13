// Gestion de l'authentification côté client

// Sauvegarder le token et les infos utilisateur
export const saveAuth = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

// Récupérer le token
export const getToken = () => {
  return localStorage.getItem('token');
};

// Récupérer les infos utilisateur
export const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Vérifier si l'utilisateur est connecté
export const isAuthenticated = () => {
  return !!getToken();
};

// Déconnexion
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Vérifier le rôle
export const hasRole = (role) => {
  const user = getUser();
  return user?.role === role;
};

// Vérifier si admin
export const isAdmin = () => hasRole('admin');

// Vérifier si enseignant
export const isEnseignant = () => hasRole('enseignant');

// Vérifier si étudiant
export const isEtudiant = () => hasRole('etudiant');