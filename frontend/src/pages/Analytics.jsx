import React from 'react';
import api from '../api/axios';
import { FileSpreadsheet, Download, TrendingUp, PieChart } from 'lucide-react';

const Analytics = () => {
  const handleExport = () => {
    const url = `${api.defaults.baseURL}export-fees/`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <TrendingUp className="text-indigo-600" /> Reports & Analytics
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
        {/* Export Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-2xl shadow-lg">
          <FileSpreadsheet size={40} className="mb-4 opacity-80" />
          <h2 className="text-xl font-bold mb-2">Financial Summary</h2>
          <p className="text-emerald-50 mb-6 text-sm">Download a full history of all student fee collections in CSV format for Excel.</p>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-white text-emerald-700 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition"
          >
            <Download size={18} /> Export CSV
          </button>
        </div>

        {/* Placeholder for future Charts */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-2xl shadow-lg">
          <PieChart size={40} className="mb-4 opacity-80" />
          <h2 className="text-xl font-bold mb-2">Visual Insights</h2>
          <p className="text-indigo-50 mb-6 text-sm">Interactive charts for attendance trends and revenue growth coming soon.</p>
          <div className="text-xs uppercase font-bold tracking-widest opacity-60">Module Locked</div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
