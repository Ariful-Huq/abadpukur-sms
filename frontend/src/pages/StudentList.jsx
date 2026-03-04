import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Users, UserPlus, Search, Eye, Edit, Trash2, User } from 'lucide-react';

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
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await api.delete(`students/${id}/`);
        setStudents(students.filter(s => s.id !== id));
      } catch (err) {
        alert("Failed to delete student.");
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
        {/* MATCHES APP.JSX: /add-student */}
        <Link to="/add-student" className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition font-bold shadow-lg shadow-indigo-100">
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
              <th className="px-6 py-4 font-semibold">Student Details</th>
              <th className="px-6 py-4 font-semibold">Grade</th>
              <th className="px-6 py-4 font-semibold text-center">Attendance</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-indigo-50/30 transition-colors group">
                <td className="px-6 py-4">
                  {/* MATCHES APP.JSX: /students/:id */}
                  <Link to={`/students/${student.id}`} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 border border-indigo-50 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                      {student.photo ? (
                        <img 
                          src={student.photo} 
                          alt={student.first_name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={20} className="text-indigo-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {student.first_name} {student.last_name}
                      </p>
                      <p className="text-xs text-gray-400 font-mono uppercase tracking-tighter">
                        ID: {student.registration_number}
                      </p>
                    </div>
                  </Link>
                </td>
                
                <td className="px-6 py-4 text-sm font-medium text-gray-600 uppercase">
                  {student.grade_name}
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
                  <div className="flex justify-end gap-1 relative z-10">
                    <Link 
                      to={`/students/${student.id}`} 
                      className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition"
                    >
                      <Eye size={18} />
                    </Link>
                    
                    {/* MATCHES APP.JSX: /edit-student/:id */}
                    <Link 
                      to={`/edit-student/${student.id}`} 
                      className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition"
                    >
                      <Edit size={18} />
                    </Link>

                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(student.id, `${student.first_name} ${student.last_name}`);
                      }}
                      className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentList;
