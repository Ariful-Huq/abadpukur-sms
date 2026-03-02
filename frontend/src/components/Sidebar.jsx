import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, UserSquare, CalendarCheck, CreditCard, PieChart, LogOut, UserSquare2 } from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/teachers', icon: UserSquare2, label: 'Teachers' },
    { path: '/students', icon: Users, label: 'Students' },
    { path: '/attendance', icon: CalendarCheck, label: 'Attendance' },
    { path: '/fees', icon: CreditCard, label: 'Fees' },
    { path: '/analytics', icon: PieChart, label: 'Analytics' },
  ];

  return (
    <div className="w-64 bg-indigo-900 text-white flex flex-col">
      <div className="p-6 text-2xl font-bold border-b border-indigo-800">
        Abadpukur School
      </div>
      <nav className="flex-1 mt-6">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-4 transition-colors ${
                isActive ? 'bg-indigo-700 border-l-4 border-white' : 'hover:bg-indigo-800'
              }`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <button 
        onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
        className="p-6 flex items-center gap-3 hover:bg-red-600 transition-colors mt-auto"
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;
