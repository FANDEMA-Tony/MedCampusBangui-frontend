import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated, getUser } from './utils/auth';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DashboardEtudiant from './pages/etudiant/DashboardEtudiant';
import DashboardEnseignant from './pages/enseignant/DashboardEnseignant';
import DashboardAdmin from './pages/admin/DashboardAdmin';

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