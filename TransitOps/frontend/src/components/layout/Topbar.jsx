import { Menu, Moon, Sun, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Topbar({ toggleSidebar, darkMode, toggleDarkMode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm h-16 flex items-center justify-between px-6 fixed top-0 left-64 right-0 z-20">
      <button onClick={toggleSidebar} className="lg:hidden text-gray-500">
        <Menu />
      </button>
      <div className="flex items-center gap-4 ml-auto">
        <button onClick={toggleDarkMode} className="text-gray-500">
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <div className="text-right">
          <p className="text-sm font-medium">{user?.full_name}</p>
          <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
        </div>
        <button onClick={handleLogout} className="text-gray-500 hover:text-red-500" title="Logout">
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}