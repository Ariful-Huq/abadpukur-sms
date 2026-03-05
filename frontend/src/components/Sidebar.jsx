import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  User, 
  CalendarCheck, 
  CreditCard, 
  LogOut, 
  BarChart3, 
  School 
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/teachers', icon: User, label: 'Teachers' },
    { path: '/students', icon: Users, label: 'Students' },
    { path: '/grades', icon: School, label: 'Grades' }, // Added Grades here
    { path: '/attendance', icon: CalendarCheck, label: 'Attendance' },
    { path: '/fees', icon: CreditCard, label: 'Fees' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  return (
    <div className="w-64 bg-indigo-900 text-white flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-indigo-800 flex items-center">
        <img 
          src="/AbadpukurSchoolLogo.svg" 
          alt="School Logo"
          style={{ height: '32px', width: '32px' }}
          className="h-8 w-auto block flex-shrink-0" 
        />
        <span className="ml-3 text-xl font-bold leading-tight">Abadpukur High School</span>
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
        className="p-6 flex items-center gap-3 hover:bg-red-600 transition-colors mt-auto border-t border-indigo-800"
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;
