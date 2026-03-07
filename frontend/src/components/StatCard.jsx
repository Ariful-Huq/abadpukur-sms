import React from 'react';

const StatCard = ({ icon, label, value, subValue, color }) => {
  return (
    <div className={`p-6 rounded-3xl ${color} flex items-center gap-5 transition-transform hover:scale-105 cursor-default`}>
      {/* Icon Container */}
      <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-center">
        {icon}
      </div>
      
      {/* Text Content */}
      <div className="flex flex-col">
        <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-gray-900 leading-none">
            {value}
          </p>
          {subValue && (
            <span className="text-[10px] font-bold text-rose-500 uppercase bg-rose-100 px-1.5 py-0.5 rounded">
              {subValue}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
