import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, Truck, Users, MapPin, Wrench, Fuel, DollarSign, FileText, Settings 
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin','fleet_manager','safety_officer','financial_analyst'] },
  { to: '/vehicles', icon: Truck, label: 'Vehicle Registry', roles: ['admin','fleet_manager','safety_officer'] },
  { to: '/drivers', icon: Users, label: 'Driver Management', roles: ['admin','fleet_manager'] },
  { to: '/trips', icon: MapPin, label: 'Trip Management', roles: ['admin','fleet_manager','driver'] },
  { to: '/maintenance', icon: Wrench, label: 'Maintenance', roles: ['admin','fleet_manager','safety_officer'] },
  { to: '/fuel', icon: Fuel, label: 'Fuel Logs', roles: ['admin','fleet_manager','driver'] },
  { to: '/expenses', icon: DollarSign, label: 'Expenses', roles: ['admin','fleet_manager','financial_analyst'] },
  { to: '/reports', icon: FileText, label: 'Reports', roles: ['admin','fleet_manager','financial_analyst'] },
];

export default function Sidebar() {
  const { user } = useAuth();
  const filtered = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <aside className="w-64 bg-sidebar text-white flex flex-col h-screen fixed left-0 top-0 z-30 transition-transform">
      <div className="p-5 border-b border-gray-700">
        <h1 className="text-xl font-bold">TransitOps</h1>
        <p className="text-xs text-gray-400">Smart Transport Platform</p>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        {filtered.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm transition-colors ${isActive ? 'bg-sidebar-hover border-l-4 border-primary-500' : 'hover:bg-sidebar-hover'}`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700 text-xs">
        Logged in as <strong>{user?.full_name}</strong> ({user?.role})
      </div>
    </aside>
  );
}