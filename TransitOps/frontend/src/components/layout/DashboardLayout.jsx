import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newMode);
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Topbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <main className="mt-16 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}