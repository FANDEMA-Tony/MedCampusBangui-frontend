import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './utils/auth';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

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
        
        {/* Dashboards (à créer dans les prochaines étapes) */}
        <Route path="/admin/dashboard" element={<div className="p-8 text-center">Dashboard Admin (À venir)</div>} />
        <Route path="/enseignant/dashboard" element={<div className="p-8 text-center">Dashboard Enseignant (À venir)</div>} />
        <Route path="/etudiant/dashboard" element={<div className="p-8 text-center">Dashboard Étudiant (À venir)</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;