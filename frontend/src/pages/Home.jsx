import React from 'react';
import { Users, GraduationCap, Calendar, DollarSign, Bell } from 'lucide-react';

const StatCard = ({ icon: Icon, title, count, color }) => (
  <div className={`p-6 rounded-xl shadow-sm border border-gray-100 bg-white flex items-center gap-4`}>
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon className="text-white" size={24} />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{count}</h3>
    </div>
  </div>
);

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Placeholder */}
      <aside className="w-64 bg-indigo-900 text-white hidden md:block">
        <div className="p-6 font-bold text-xl border-b border-indigo-800">EduManager Pro</div>
        <nav className="p-4 space-y-2">
          <div className="p-3 bg-indigo-800 rounded-lg cursor-pointer">Dashboard</div>
          <div className="p-3 hover:bg-indigo-800 rounded-lg cursor-pointer transition">Students</div>
          <div className="p-3 hover:bg-indigo-800 rounded-lg cursor-pointer transition">Teachers</div>
          <div className="p-3 hover:bg-indigo-800 rounded-lg cursor-pointer transition">Attendance</div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800">School Overview</h1>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:text-indigo-600">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
              AD
            </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard icon={Users} title="Total Students" count="1,240" color="bg-blue-500" />
            <StatCard icon={GraduationCap} title="Total Teachers" count="84" color="bg-purple-500" />
            <StatCard icon={Calendar} title="Events Today" count="3" color="bg-orange-500" />
            <StatCard icon={DollarSign} title="Fees Collected" count="$12.5k" color="bg-green-500" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-4">Recent Enrollments</h2>
              <ul className="divide-y divide-gray-100">
                {[1, 2, 3].map((i) => (
                  <li key={i} className="py-3 flex justify-between">
                    <div>
                      <p className="font-medium text-gray-800">Student Name {i}</p>
                      <p className="text-sm text-gray-500">Grade {10 - i}</p>
                    </div>
                    <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded">Active</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Calendar/Notice Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-4">Upcoming Deadlines</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-indigo-500 pl-4 py-1">
                  <p className="font-medium">Mid-Term Exams</p>
                  <p className="text-sm text-gray-500">Starts Oct 15, 2026</p>
                </div>
                <div className="border-l-4 border-orange-500 pl-4 py-1">
                  <p className="font-medium">Annual Sports Meet</p>
                  <p className="text-sm text-gray-500">Nov 02, 2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
