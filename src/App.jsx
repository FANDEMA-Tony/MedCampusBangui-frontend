import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated, getUser } from './utils/auth';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DashboardEtudiant from './pages/etudiant/DashboardEtudiant';
import CoursDetail from './pages/etudiant/CoursDetail';
import DashboardEnseignant from './pages/enseignant/DashboardEnseignant';
import DashboardAdmin from './pages/admin/DashboardAdmin';
import Messagerie from './pages/messagerie/Messagerie';
import Bibliotheque from './pages/bibliotheque/Bibliotheque';
import DonneesSanitaires from './pages/donnees-sanitaires/DonneesSanitaires';
import Calendrier from './pages/Calendrier'; // ✅ AJOUT SPRINT 3
import SearchResults from './components/search/SearchResults';
import FicheEtudiant from './pages/admin/FicheEtudiant';
import FicheEnseignant from './pages/admin/FicheEnseignant';
import FicheCours from './pages/admin/FicheCours';

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
        <Route path="/etudiant/cours/:id" element={<CoursDetail />} />

        {/* 📧 MESSAGERIE */}
        <Route path="/messagerie" element={
          isAuthenticated() ? <Messagerie /> : <Navigate to="/login" />
        } />

        {/* 📚 BIBLIOTHÈQUE */}
        <Route path="/bibliotheque" element={
          isAuthenticated() ? <Bibliotheque /> : <Navigate to="/login" />
        } />

        {/* 🏥 DONNÉES SANITAIRES */}
        <Route path="/donnees-sanitaires" element={
          isAuthenticated() ? <DonneesSanitaires /> : <Navigate to="/login" />
        } />

        {/* 📅 CALENDRIER ACADÉMIQUE — Sprint 3 */}
        <Route path="/calendrier" element={
          isAuthenticated() ? <Calendrier /> : <Navigate to="/login" />
        } />

        {/* 🔍 RECHERCHE GLOBALE — Sprint 4 */}
        <Route path="/search" element={
          isAuthenticated() ? <SearchResults /> : <Navigate to="/login" />
        } />

        {/* Route dashboard générique */}
        <Route path="/dashboard" element={<DashboardRedirect />} />

        {/* 👨‍🎓 FICHE ÉTUDIANT */}
        <Route path="/etudiant/:id" element={
          isAuthenticated() ? <FicheEtudiant /> : <Navigate to="/login" />
        } />

        {/* 👨‍🏫 FICHE ENSEIGNANT */}
        <Route path="/enseignant/:id" element={
          isAuthenticated() ? <FicheEnseignant /> : <Navigate to="/login" />
        } />

        {/* 📚 FICHE COURS — Admin/Enseignant uniquement */}
        <Route path="/cours/:id" element={
          isAuthenticated() && getUser()?.role !== 'etudiant'
            ? <FicheCours />
            : <Navigate to="/dashboard" />
        } />F
      </Routes>
    </BrowserRouter>
  );
}

// Composant pour rediriger selon le rôle
function DashboardRedirect() {
  const user = getUser();

  if (!user) return <Navigate to="/login" />;

  switch (user.role) {
    case 'admin': return <Navigate to="/admin/dashboard" />;
    case 'enseignant': return <Navigate to="/enseignant/dashboard" />;
    case 'etudiant': return <Navigate to="/etudiant/dashboard" />;
    default: return <Navigate to="/login" />;
  }
}

export default App;