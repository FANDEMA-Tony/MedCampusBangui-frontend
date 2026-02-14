import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './utils/auth';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DashboardEtudiant from './pages/etudiant/DashboardEtudiant';
import DashboardEnseignant from './pages/enseignant/DashboardEnseignant';

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
        <Route path="/admin/dashboard" element={<div className="p-8 text-center">Dashboard Admin (À venir)</div>} />
        <Route path="/enseignant/dashboard" element={<DashboardEnseignant />} />
        <Route path="/etudiant/dashboard" element={<DashboardEtudiant />} />
        
        {/* Route dashboard générique */}
        <Route path="/dashboard" element={<Navigate to="/etudiant/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;