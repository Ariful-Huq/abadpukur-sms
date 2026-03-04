import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
  User, 
  Phone, 
  MapPin, 
  CreditCard, 
  ArrowLeft, 
  Activity, 
  Send 
} from 'lucide-react';

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    api.get(`students/${id}/`).then(res => setStudent(res.data));
  }, [id]);

  if (!student) return <div className="p-10 text-center text-gray-500 font-bold">Loading Profile...</div>;

  // Generate last 30 days for the chart
  const last30Days = [...Array(30)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  // WhatsApp Logic for Fee Reminders
  const sendWhatsAppReminder = (pay) => {
    const message = `Assalamu Alaikum, this is a reminder regarding ${student.first_name}'s fee for ${pay.fee_name}. Amount: ৳${pay.amount_paid}. Status: ${pay.status}. Please clear the dues. Thank you!`;
    let phone = student.parent_phone.replace(/\D/g, '');
    if (phone.startsWith('0')) phone = '88' + phone;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10 px-4">
      {/* Navigation */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition font-bold"
      >
        <ArrowLeft size={18} /> Back to List
      </button>

      {/* Header Info Card */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-center">
        <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 shadow-inner">
          <User size={60} />
        </div>
        <div className="flex-1 space-y-2 text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">
            {student.first_name} {student.last_name}
          </h1>
          <p className="text-indigo-600 font-mono font-bold tracking-widest bg-indigo-50 inline-block px-3 py-1 rounded-lg">
            {student.registration_number}
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-500 pt-2">
            <span className="flex items-center gap-1 font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded uppercase tracking-tighter">
              {student.grade_name}
            </span>
            <span className="flex items-center gap-1"><MapPin size={14}/> {student.address}</span>
            <span className="flex items-center gap-1"><Phone size={14}/> {student.parent_phone}</span>
          </div>
        </div>
        <div className="bg-indigo-600 text-white p-6 rounded-2xl text-center shadow-lg shadow-indigo-200 min-w-[140px]">
          <p className="text-xs uppercase font-bold opacity-80 mb-1">Total Attendance</p>
          <div className="text-4xl font-black">{student.attendance_rate}%</div>
        </div>
      </div>

      {/* Attendance Chart Section - Grid Layout Fixes the Scrollbar */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h3 className="font-bold text-gray-700 flex items-center gap-2">
            <Activity size={18} className="text-indigo-500" /> Attendance: Last 30 Days
          </h3>
          <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1 text-green-600">
              <div className="w-3 h-3 bg-[#22c55e] rounded-sm"></div> Present
            </span>
            <span className="flex items-center gap-1 text-red-600">
              <div className="w-3 h-3 bg-[#ef4444] rounded-sm"></div> Absent
            </span>
          </div>
        </div>
        
        {/* Fixed Grid: 10 columns for a clean 3-row layout */}
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-3">
          {last30Days.map(date => {
            const record = student.attendance_history?.find(r => String(r.date).trim() === String(date).trim());
            
            let boxColor = '#f3f4f6'; // Default Gray
            if (record) {
              const isPresent = record.status === 'P' || record.status === 'Present';
              boxColor = isPresent ? '#22c55e' : '#ef4444';
            }
            
            return (
              <div key={date} className="group relative flex justify-center">
                <div 
                  className="w-full aspect-square max-w-[44px] rounded-lg transition-all duration-200 hover:scale-110 cursor-help shadow-sm border border-black/5"
                  style={{ backgroundColor: boxColor }}
                ></div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity shadow-xl font-bold border border-white/10">
                  {new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}: {record ? (record.status === 'P' ? '✅ Present' : '❌ Absent') : '⚪ No Record'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment History Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-2 font-bold text-gray-700 bg-gray-50/50">
            <CreditCard size={20} className="text-emerald-500" /> Payment History
          </div>
          <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
            {student.payment_history?.map(pay => (
              <div key={pay.id} className="flex justify-between items-center p-4 bg-white rounded-xl border border-gray-100 hover:border-indigo-200 transition-colors shadow-sm">
                <div>
                  <p className="font-bold text-gray-800">{pay.fee_name}</p>
                  <p className="text-xs text-gray-400">{new Date(pay.paid_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-black text-emerald-600">৳{pay.amount_paid}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${pay.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                      {pay.status}
                    </span>
                  </div>
                  {pay.status === 'PENDING' && (
                    <button 
                      onClick={() => sendWhatsAppReminder(pay)}
                      className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition shadow-md"
                      title="Send WhatsApp Reminder"
                    >
                      <Send size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {student.payment_history?.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-400">No payments found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Information Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
          <h3 className="text-lg font-bold text-gray-700 border-b pb-4">Detailed Information</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Parent Name</p>
              <p className="font-semibold text-gray-800">{student.parent_name}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Phone</p>
              <p className="font-semibold text-gray-800">{student.parent_phone}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Date of Birth</p>
              <p className="font-semibold text-gray-800">{student.date_of_birth}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Gender</p>
              <p className="font-semibold text-gray-800 capitalize">{student.gender}</p>
            </div>
            <div className="col-span-2 pt-2">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Current Address</p>
              <p className="font-semibold text-gray-800 leading-relaxed">{student.address}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
