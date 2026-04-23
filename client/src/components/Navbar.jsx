import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="text-xl font-bold text-blue-700">
          📚 CampusStudy
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-2">
          <Link
            to="/dashboard"
            className={`text-sm px-3 py-2 rounded-lg transition-colors ${
              isActive('/dashboard') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Dashboard
          </Link>

          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className={`text-sm px-3 py-2 rounded-lg transition-colors ${
                isActive('/admin') ? 'bg-purple-50 text-purple-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Admin
            </Link>
          )}
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-600 transition-colors px-2 py-1"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
