import { useNavigate } from 'react-router-dom';
import { logout, getUser } from '../../utils/auth';
import Button from '../common/Button';

export default function Navbar() {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-3xl mr-3">🏥</span>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                MedCampus Bangui
              </h1>
              <p className="text-xs text-gray-500">
                {user?.role === 'admin' && 'Administration'}
                {user?.role === 'enseignant' && 'Espace Enseignant'}
                {user?.role === 'etudiant' && 'Espace Étudiant'}
              </p>
            </div>
          </div>

          {/* User info & Logout */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">
                {user?.prenom} {user?.nom}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <Button
              variant="danger"
              onClick={handleLogout}
              className="text-sm"
            >
              Déconnexion
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}