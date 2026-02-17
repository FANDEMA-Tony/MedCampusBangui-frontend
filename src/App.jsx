import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated, getUser } from './utils/auth';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DashboardEtudiant from './pages/etudiant/DashboardEtudiant';
import DashboardEnseignant from './pages/enseignant/DashboardEnseignant';
import DashboardAdmin from './pages/admin/DashboardAdmin';
import Messagerie from './pages/messagerie/Messagerie';
import Bibliotheque from './pages/bibliotheque/Bibliotheque'; // 🆕 AJOUTÉ
import DonneesSanitaires from './pages/donnees-sanitaires/DonneesSanitaires'; // 🆕 AJOUTÉ

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route par défaut */}
        <Route path="/" element={
          isAuthenticated() ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
        } />
        
        {/* Routes d'authentification */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Dashboards */}
        <Route path="/admin/dashboard" element={<DashboardAdmin />} />
        <Route path="/enseignant/dashboard" element={<DashboardEnseignant />} />
        <Route path="/etudiant/dashboard" element={<DashboardEtudiant />} />

        {/* 📧 MESSAGERIE - Accessible à tous les utilisateurs authentifiés */}
        <Route path="/messagerie" element={
          isAuthenticated() ? <Messagerie /> : <Navigate to="/login" />
        } />

        {/* 📚 BIBLIOTHÈQUE - Accessible à tous les utilisateurs authentifiés */}
        <Route path="/bibliotheque" element={
          isAuthenticated() ? <Bibliotheque /> : <Navigate to="/login" />
        } />

        {/* 🏥 DONNÉES SANITAIRES - Accessible à tous les utilisateurs authentifiés */}
        <Route path="/donnees-sanitaires" element={
          isAuthenticated() ? <DonneesSanitaires /> : <Navigate to="/login" />
        } />
        
        {/* Route dashboard générique - redirige selon le rôle */}
        <Route path="/dashboard" element={<DashboardRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

// Composant pour rediriger selon le rôle
function DashboardRedirect() {
  const user = getUser();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin/dashboard" />;
    case 'enseignant':
      return <Navigate to="/enseignant/dashboard" />;
    case 'etudiant':
      return <Navigate to="/etudiant/dashboard" />;
    default:
      return <Navigate to="/login" />;
  }
}

export default App;