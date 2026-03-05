import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { Save, Loader2, ChevronLeft, ChevronRight, Check, Clock, Trash2, X, Search, FileDown } from 'lucide-react';

const Attendance = () => {
  const [grades, setGrades] = useState([]);
  const [selectedGradeName, setSelectedGradeName] = useState(''); // "Grade 10"
  const [selectedGrade, setSelectedGrade] = useState('');         // Unique ID for Grade+Section
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const [attendanceRecords, setAttendanceRecords] = useState({});

  // 1. Initial Load: Fetch all available grade objects
  useEffect(() => {
    api.get('grades/').then(res => {
      // Sort alphabetically by name then section
      const sorted = res.data.sort((a, b) => 
        a.name.localeCompare(b.name) || a.section.localeCompare(b.section)
      );
      setGrades(sorted);
    });
  }, []);

  // 2. Data Fetching: Runs when a specific Section (ID) or Date changes
  useEffect(() => {
    if (selectedGrade) fetchData();
    else {
        setStudents([]);
        setAttendanceRecords({});
    }
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

  // Logic for Dual Dropdowns
  const uniqueGradeNames = useMemo(() => {
    return [...new Set(grades.map(g => g.name))];
  }, [grades]);

  const availableSections = useMemo(() => {
    return grades.filter(g => g.name === selectedGradeName);
  }, [grades, selectedGradeName]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const daysArray = Array.from({ length: getDaysInMonth(year, month) }, (_, i) => i + 1);

  const markAllPresent = () => {
    const newRecords = { ...attendanceRecords };
    students.forEach(student => {
      daysArray.forEach(day => {
        const dateObj = new Date(year, month, day);
        if (dateObj.getDay() !== 5 && dateObj.getDay() !== 6) {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          newRecords[`${student.id}-${dateStr}`] = 'P';
        }
      });
    });
    setAttendanceRecords(newRecords);
  };

  const getDailyCount = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return students.reduce((acc, student) => {
      const status = attendanceRecords[`${student.id}-${dateStr}`];
      return (status === 'P' || status === 'L') ? acc + 1 : acc;
    }, 0);
  };

  const getStudentTotal = (studentId) => {
    return daysArray.reduce((acc, day) => {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const status = attendanceRecords[`${studentId}-${dateStr}`];
      return (status === 'P' || status === 'L') ? acc + 1 : acc;
    }, 0);
  };

  const exportToCSV = () => {
    let csv = "Student," + daysArray.join(",") + ",Total\n";
    students.forEach(s => {
      let row = `${s.first_name} ${s.last_name}`;
      daysArray.forEach(day => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        row += `,${attendanceRecords[`${s.id}-${dateStr}`] || ''}`;
      });
      row += `,${getStudentTotal(s.id)}`;
      csv += row + "\n";
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Attendance_${selectedGradeName}_${year}_${month + 1}.csv`;
    a.click();
  };

  const handleToggle = (studentId, dateStr) => {
    const key = `${studentId}-${dateStr}`;
    const current = attendanceRecords[key];
    let nextStatus;
    if (!current) nextStatus = 'P';
    else if (current === 'P') nextStatus = 'L';
    else if (current === 'L') nextStatus = 'A';
    else nextStatus = undefined;

    setAttendanceRecords(prev => {
      const newRecs = { ...prev };
      if (!nextStatus) delete newRecs[key];
      else newRecs[key] = nextStatus;
      return newRecs;
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'P': return 'bg-green-500 border-green-500 text-white';
      case 'L': return 'bg-amber-400 border-amber-400 text-white';
      case 'A': return 'bg-red-500 border-red-500 text-white';
      default: return 'border-gray-200 bg-white text-transparent';
    }
  };

  const submitAttendance = async () => {
    setSaving(true);
    const payload = {
      records: Object.keys(attendanceRecords).map(key => {
        const firstDashIndex = key.indexOf('-');
        return { 
          student_id: parseInt(key.substring(0, firstDashIndex)), 
          date: key.substring(firstDashIndex + 1), 
          status: attendanceRecords[key] 
        };
      })
    };
    try {
      await api.post('attendance/bulk_mark/', payload);
      alert("Records saved successfully!");
      fetchData();
    } catch (err) { alert("Error saving records."); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Control Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-3 items-center">
          {/* Grade Dropdown */}
          <select 
            className="p-3 border rounded-xl w-40 font-medium outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={(e) => {
                setSelectedGradeName(e.target.value);
                setSelectedGrade('');
            }}
            value={selectedGradeName}
          >
            <option value="">Grade</option>
            {uniqueGradeNames.map(name => <option key={name} value={name}>{name}</option>)}
          </select>

          {/* Section Dropdown */}
          <select 
            className={`p-3 border rounded-xl w-32 font-medium outline-none focus:ring-2 focus:ring-indigo-500 ${!selectedGradeName ? 'bg-gray-50 opacity-50' : ''}`}
            disabled={!selectedGradeName}
            onChange={(e) => setSelectedGrade(e.target.value)}
            value={selectedGrade}
          >
            <option value="">Section</option>
            {availableSections.map(g => <option key={g.id} value={g.id}>{g.section}</option>)}
          </select>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search student..."
              className="pl-10 pr-4 py-3 border rounded-xl w-64 outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Date Navigator */}
          <div className="flex items-center bg-gray-100 rounded-xl p-1 ml-2">
            <button onClick={() => setViewDate(new Date(year, month - 1))} className="p-2 hover:bg-white rounded-lg transition"><ChevronLeft size={20}/></button>
            <span className="px-4 font-bold text-gray-700 min-w-[140px] text-center">{viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
            <button onClick={() => setViewDate(new Date(year, month + 1))} className="p-2 hover:bg-white rounded-lg transition"><ChevronRight size={20}/></button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button onClick={exportToCSV} disabled={!selectedGrade} className="bg-emerald-50 text-emerald-700 px-5 py-3 rounded-xl font-bold flex items-center gap-2 border border-emerald-100 hover:bg-emerald-100 transition disabled:opacity-50">
            <FileDown size={20} /> Export
          </button>
          <button onClick={markAllPresent} disabled={!selectedGrade} className="bg-green-600 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 transition disabled:bg-gray-300">
            <Check size={20} /> Mark All
          </button>
          <button onClick={() => {if(window.confirm("Clear local marks?")) setAttendanceRecords({})}} disabled={!selectedGrade} className="bg-red-500 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-red-600 transition disabled:bg-gray-300">
            <Trash2 size={20} /> Clear All
          </button>
          <button onClick={submitAttendance} disabled={saving || !selectedGrade} className="bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition disabled:bg-gray-300">
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} Save
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center text-gray-400">
                <Loader2 className="animate-spin mb-4" size={40} />
                <p className="font-medium">Loading attendance data...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b text-gray-400">
                <tr>
                  <th className="px-6 py-4 sticky left-0 bg-gray-50 z-20 border-r min-w-[200px]">Student Name</th>
                  {daysArray.map(d => {
                      const isWeekend = new Date(year, month, d).getDay() === 5 || new Date(year, month, d).getDay() === 6;
                      return <th key={d} className={`px-2 py-4 text-center text-[10px] font-bold border-r min-w-[35px] ${isWeekend ? 'bg-gray-200 text-gray-700' : ''}`}>{d}</th>
                  })}
                  <th className="px-4 py-4 text-center text-xs font-bold bg-indigo-50 text-indigo-600 sticky right-0 z-20">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-800 sticky left-0 bg-white z-10 border-r">{student.first_name} {student.last_name}</td>
                    {daysArray.map(day => {
                      const dateObj = new Date(year, month, day);
                      const isWeekend = dateObj.getDay() === 5 || dateObj.getDay() === 6;
                      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const status = attendanceRecords[`${student.id}-${dateStr}`];
                      return (
                        <td key={day} className={`p-0 border-r ${isWeekend ? 'bg-gray-100/80' : ''} ${status === 'P' ? 'bg-green-50' : status === 'L' ? 'bg-amber-50' : status === 'A' ? 'bg-red-50' : ''}`}>
                          <button onClick={() => !isWeekend && handleToggle(student.id, dateStr)} disabled={isWeekend} className="w-full h-10 flex items-center justify-center">
                            <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${getStatusColor(status)}`}>
                              {status === 'P' && <Check size={14} strokeWidth={4} />}
                              {status === 'L' && <Clock size={12} strokeWidth={4} />}
                              {status === 'A' && <X size={14} strokeWidth={4} />}
                            </div>
                          </button>
                        </td>
                      );
                    })}
                    <td className="px-4 py-4 text-center font-bold text-indigo-600 bg-indigo-50 sticky right-0 z-10 border-l shadow-[-4px_0_10px_rgba(0,0,0,0.02)]">
                      {getStudentTotal(student.id)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100 font-bold border-t">
                <tr>
                  <td className="px-6 py-4 sticky left-0 bg-gray-100 z-10 border-r">Daily Present Total</td>
                  {daysArray.map(day => (
                    <td key={day} className="text-center text-indigo-600 border-r font-mono text-sm">{getDailyCount(day)}</td>
                  ))}
                  <td className="bg-indigo-100 sticky right-0 border-l"></td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
