import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Save, Loader2, Calendar as CalIcon, ChevronLeft, ChevronRight, Check, Clock } from 'lucide-react';

const Attendance = () => {
  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [viewDate, setViewDate] = useState(new Date());
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  
  const [attendanceRecords, setAttendanceRecords] = useState({});

  useEffect(() => {
    api.get('grades/').then(res => setGrades(res.data));
  }, []);

  useEffect(() => {
    if (selectedGrade) fetchData();
  }, [selectedGrade, viewDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentRes, attendanceRes] = await Promise.all([
        api.get(`students/?grade=${selectedGrade}`),
        api.get(`attendance/monthly/?grade=${selectedGrade}&month=${month + 1}&year=${year}`)
      ]);
      setStudents(studentRes.data);
      const initialMap = {};
      attendanceRes.data.forEach(rec => {
        initialMap[`${rec.student}-${rec.date}`] = rec.status;
      });
      setAttendanceRecords(initialMap);
    } finally { setLoading(false); }
  };

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const daysArray = Array.from({ length: getDaysInMonth(year, month) }, (_, i) => i + 1);

  // --- UPDATED TOGGLE LOGIC ---
  const handleToggle = (studentId, dateStr) => {
    const key = `${studentId}-${dateStr}`;
    const current = attendanceRecords[key];
    let nextStatus = 'P'; // Default to Present if empty
    
    if (current === 'P') nextStatus = 'L';      // P -> L
    else if (current === 'L') nextStatus = 'A'; // L -> A (unmarked)
    else nextStatus = 'P';                      // A -> P

    setAttendanceRecords(prev => ({
      ...prev,
      [key]: nextStatus
    }));
  };

  // --- UPDATED COLOR LOGIC ---
  const getStatusColor = (status) => {
    switch(status) {
      case 'P': return 'bg-green-500 border-green-500 text-white';
      case 'L': return 'bg-amber-400 border-amber-400 text-white';
      default: return 'border-gray-200 bg-white text-transparent';
    }
  };

  const submitAttendance = async () => {
    setSaving(true);
    const payload = {
      records: Object.keys(attendanceRecords).map(key => {
        const firstDashIndex = key.indexOf('-');
        const studentId = key.substring(0, firstDashIndex);
        const dateStr = key.substring(firstDashIndex + 1); // This will be "YYYY-MM-DD"
        return { student_id: parseInt(studentId), date : dateStr, status: attendanceRecords[key] };
      })
    };
    try {
      await api.post('attendance/bulk_mark/', payload);
      alert("Monthly records updated!");
      fetchData(); // Refresh data after saving
    } catch (err) {
      console.error("Save error:", err);
      alert("Error saving attendance."); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border flex flex-wrap gap-6 items-center justify-between">
        <div className="flex gap-4 items-center">
          <select 
            className="p-3 border rounded-xl w-48 focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
            onChange={(e) => setSelectedGrade(e.target.value)}
          >
            <option value="">Select Class</option>
            {grades.map(g => <option key={g.id} value={g.id}>{g.name} - {g.section}</option>)}
          </select>
          
          <div className="flex items-center bg-gray-100 rounded-xl p-1">
            <button onClick={() => setViewDate(new Date(year, month - 1))} className="p-2 hover:bg-white rounded-lg transition"><ChevronLeft size={20}/></button>
            <span className="px-4 font-bold text-gray-700 min-w-[140px] text-center">
              {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={() => setViewDate(new Date(year, month + 1))} className="p-2 hover:bg-white rounded-lg transition"><ChevronRight size={20}/></button>
          </div>
        </div>

        <button 
          onClick={submitAttendance} 
          disabled={saving || !selectedGrade}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 disabled:bg-gray-300 transition shadow-lg shadow-indigo-100"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} 
          Save Month Data
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 sticky left-0 bg-gray-50 z-10 border-r min-w-[200px]">Student Name</th>
                {daysArray.map(d => (
                  <th key={d} className="px-2 py-4 text-center text-[10px] font-bold text-gray-400 border-r min-w-[35px]">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.map(student => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-800 sticky left-0 bg-white z-10 border-r">
                    {student.first_name} {student.last_name}
                  </td>
                  {daysArray.map(day => {
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const status = attendanceRecords[`${student.id}-${dateStr}`];
                    
                    return (
                      <td key={day} className={`p-0 border-r text-center transition-colors ${status === 'P' ? 'bg-green-50' : status === 'L' ? 'bg-amber-50' : ''}`}>
                        <button 
                          onClick={() => handleToggle(student.id, dateStr)}
                          className="w-full h-12 flex items-center justify-center group"
                        >
                          <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${getStatusColor(status)}`}>
                            {status === 'P' && <Check size={14} strokeWidth={4} />}
                            {status === 'L' && <Clock size={12} strokeWidth={4} />}
                          </div>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Legend */}
      <div className="flex gap-4 text-xs font-semibold text-gray-500 px-2">
         <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded"></div> Present (Click once)</div>
         <div className="flex items-center gap-1"><div className="w-3 h-3 bg-amber-400 rounded"></div> Late (Click twice)</div>
         <div className="flex items-center gap-1"><div className="w-3 h-3 border border-gray-300 rounded"></div> Absent (Click thrice)</div>
      </div>
    </div>
  );
};

export default Attendance;
