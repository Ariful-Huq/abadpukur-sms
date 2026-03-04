import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Users, UserPlus, Search, Eye, Edit, Trash2 } from 'lucide-react';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get('students/');
      setStudents(res.data);
    } catch (err) {
      console.error("Failed to fetch students", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This will remove all their attendance and fee records.`)) {
      try {
        await api.delete(`students/${id}/`);
        // Remove from local state so the UI updates immediately
        setStudents(students.filter(s => s.id !== id));
      } catch (err) {
        alert("Failed to delete student. They might have related records preventing deletion.");
      }
    }
  };

  const filteredStudents = students.filter(s => 
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.registration_number.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
            <Users className="text-indigo-600" /> Student Directory
          </h1>
          <p className="text-gray-500 text-sm">Total Active Students: {filteredStudents.length}</p>
        </div>
        <Link to="/students/add" className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition font-bold shadow-lg shadow-indigo-100">
          <UserPlus size={18} /> Add Student
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search by name or ID..."
          className="w-full pl-10 pr-4 py-3 border rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition bg-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-semibold">Student Name</th>
              <th className="px-6 py-4 font-semibold">Grade</th>
              <th className="px-6 py-4 font-semibold text-center">Attendance</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-indigo-50/30 transition-colors group">
                <td className="px-6 py-4">
                  <Link to={`/students/${student.id}`} className="block">
                    <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {student.first_name} {student.last_name}
                    </p>
                    <p className="text-xs text-gray-400 font-mono uppercase">{student.registration_number}</p>
                  </Link>
                </td>
                
                <td className="px-6 py-4">
                  <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded uppercase">
                    {student.grade_name}
                  </span>
                </td>

                <td className="px-6 py-4 text-center">
                  <div className="inline-flex items-center gap-2">
                    <div className="w-12 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${student.attendance_rate < 75 ? 'bg-red-500' : 'bg-green-500'}`} 
                        style={{ width: `${student.attendance_rate}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-bold text-gray-700">{student.attendance_rate}%</span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex justify-end gap-1">
                    <Link 
                      to={`/students/${student.id}`} 
                      className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition"
                      title="View Profile"
                    >
                      <Eye size={18} />
                    </Link>
                    
                    <Link 
                      to={`/students/edit/${student.id}`} 
                      className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition"
                      title="Edit Student"
                    >
                      <Edit size={18} />
                    </Link>

                    {/* RE-ADDED DELETE BUTTON */}
                    <button 
                      onClick={() => handleDelete(student.id, `${student.first_name} ${student.last_name}`)}
                      className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                      title="Delete Student"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredStudents.length === 0 && !loading && (
          <div className="p-20 text-center text-gray-400">
            <Users size={40} className="mx-auto mb-4 opacity-20" />
            <p>No students found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentList;
