import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { CheckCircle, XCircle, Save, Loader2, Calendar as CalIcon } from 'lucide-react';

const Attendance = () => {
  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [students, setStudents] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState({}); // { studentId: 'P' or 'A' }
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('grades/').then(res => setGrades(res.data));
  }, []);

  const fetchStudents = async (gradeId) => {
    setLoading(true);
    try {
      const res = await api.get(`students/?grade=${gradeId}`);
      setStudents(res.data);
      // Default everyone to 'P' (Present)
      const initialStatus = {};
      res.data.forEach(s => initialStatus[s.id] = 'P');
      setAttendanceRecords(initialStatus);
    } finally { setLoading(false); }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords(prev => ({ ...prev, [studentId]: status }));
  };

  const submitAttendance = async () => {
    const payload = {
      records: Object.keys(attendanceRecords).map(id => ({
        student_id: id,
        status: attendanceRecords[id],
        date: attendanceDate
      }))
    };
    try {
      await api.post('attendance/bulk_mark/', payload);
      alert("Attendance Saved!");
    } catch (err) { alert("Error saving attendance."); }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-bold mb-2">Select Grade</label>
          <select 
            className="p-2 border rounded-lg w-48"
            onChange={(e) => { setSelectedGrade(e.target.value); fetchStudents(e.target.value); }}
          >
            <option value="">Choose Class...</option>
            {grades.map(g => <option key={g.id} value={g.id}>{g.name} - {g.section}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold mb-2">Date</label>
          <input type="date" value={attendanceDate} className="p-2 border rounded-lg" onChange={e => setAttendanceDate(e.target.value)} />
        </div>
      </div>

      {students.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.map(student => (
                <tr key={student.id}>
                  <td className="px-6 py-4 font-medium">{student.first_name} {student.last_name}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleStatusChange(student.id, 'P')}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition ${attendanceRecords[student.id] === 'P' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}
                      >
                        <CheckCircle size={14} /> Present
                      </button>
                      <button 
                        onClick={() => handleStatusChange(student.id, 'A')}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition ${attendanceRecords[student.id] === 'A' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-400'}`}
                      >
                        <XCircle size={14} /> Absent
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-6 bg-gray-50 border-t">
            <button onClick={submitAttendance} className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 transition">
              <Save size={20} /> Save Daily Attendance
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
