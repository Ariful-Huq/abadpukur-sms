import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Users, UserCheck, Calendar, TrendingUp } from 'lucide-react';

const Home = () => {
  const [stats, setStats] = useState({ total_students: 0, total_teachers: 0, attendance_rate: 0 });

  useEffect(() => {
    api.get('dashboard-stats/').then(res => setStats(res.data));
  }, []);

  const cards = [
    { label: 'Total Students', value: stats.total_students, icon: Users, color: 'bg-blue-500' },
    { label: 'Total Teachers', value: stats.total_teachers, icon: UserCheck, color: 'bg-green-500' },
    { label: "Today's Attendance", value: `${stats.attendance_rate}%`, icon: Calendar, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">School Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
            <div className={`${card.color} p-4 rounded-xl text-white`}>
              <card.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{card.label}</p>
              <h2 className="text-2xl font-bold text-gray-900">{card.value}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder for a Chart or Recent Activity */}
      <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-200 text-center text-gray-400">
        <TrendingUp className="mx-auto mb-2" size={40} />
        <p>Charts and recent activity will appear here as you add more data.</p>
      </div>
    </div>
  );
};

export default Home;
