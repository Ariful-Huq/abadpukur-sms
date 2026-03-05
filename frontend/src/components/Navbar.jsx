import React from 'react';
import { Search, Bell, User } from 'lucide-react';

const Navbar = () => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Search Bar */}
      <div className="relative w-96">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
          <Search size={20} />
        </span>
        <input
          type="text"
          placeholder="Search students, fees, or staff..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* Right Side Icons */}
      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-px bg-gray-200 mx-2"></div>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-gray-700">School Admin</p>
            <p className="text-xs text-gray-500">Super User</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
