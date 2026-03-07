import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Users, GraduationCap, DollarSign, Activity, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import StatCard from '../components/StatCard';

const Home = () => {
  const [stats, setStats] = useState({
    total_students: 0,
    total_teachers: 0,
    attendance_rate: 0,
    late_today: 0, // Added to state
    total_fees: 0,
    fee_trend: [],
    grade_distribution: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('dashboard-stats/');
        setStats(res.data);
      } catch (err) {
        console.error("Dashboard failed to load", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-10 text-center font-bold">Loading Edumanager Insights...</div>;

  const COLORS = ['#4f46e5', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

  return (
    <div className="space-y-8 p-6 pb-20">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Users className="text-blue-600" />} label="Active Students" value={stats.total_students} color="bg-blue-50" />
        <StatCard icon={<GraduationCap className="text-indigo-600" />} label="Active Teachers" value={stats.total_teachers} color="bg-indigo-50" />
        <StatCard icon={<DollarSign className="text-emerald-600" />} label="Total Revenue" value={`৳${stats.total_fees}`} color="bg-emerald-50" />
        {/* FIXED: Changed icon from <Attendance/> to <Activity/> */}
        <StatCard 
          icon={<Activity className="text-rose-600" />} 
          label="Attendance Rate" 
          value={`${stats.attendance_rate}%`} 
          subValue={`${stats.late_today} Late Today`} 
          color="bg-rose-50" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-500" /> Revenue Collection Trend
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.fee_trend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { month: 'short' })} 
                  tick={{fontSize: 12}}
                />
                <YAxis tick={{fontSize: 12}} />
                <Tooltip 
                   contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                   formatter={(value) => [`৳${value}`, "Amount"]}
                />
                <Line type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={4} dot={{ r: 6 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grade Distribution Bar Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Students per Grade</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.grade_distribution.filter(g => g.count > 0)}>
                {/* FIXED: Using display_name to show Section info */}
                <XAxis dataKey={stats.grade_distribution[0]?.display_name ? "display_name" : "name"} tick={{fontSize: 10}} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                  {stats.grade_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
