import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { UserPlus, Search, Edit, Trash2, Filter, Loader2, Eye, EyeIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchStudents = async (query = '') => {
    setLoading(true);
    try {
      // This uses the 'search' filter we enabled in Django's views.py
      const response = await api.get(`students/?search=${query}`);
      setStudents(response.data);
    } catch (error) {
      console.error("Failed to fetch students", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStudents(searchTerm);
  };

  const handleDelete = async (id, name) => {
    // Always ask for confirmation before deleting data!
    if (window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      try {
        await api.delete(`students/${id}/`);
        
        // Update the UI immediately by filtering out the deleted student
        setStudents(students.filter(student => student.id !== id));
        
        alert("Student record deleted successfully.");
      } catch (error) {
        console.error("Delete failed:", error);
        alert("Could not delete student. They might have related records (like attendance).");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Student Directory</h1>
          <p className="text-gray-500 text-sm">Manage and view all enrolled students</p>
        </div>
        <Link 
          to="/add-student" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
          <UserPlus size={18} /> Add New Student
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search by name or registration ID..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition">
          <Filter size={18} /> Filters
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p>Loading student data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-semibold text-sm uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Registration ID</th>
                  <th className="px-6 py-4">Grade/Class</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.length > 0 ? (
                  students.map((student) => (
                    <tr key={student.id} className="hover:bg-indigo-50/30 transition group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{student.first_name} {student.last_name}</div>
                        <div className="text-xs text-gray-500">{student.parent_phone}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-600">{student.registration_number}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">Grade {student.grade_name || 'No Grade Assigned'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          student.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {student.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-3 text-gray-400">
                          <Link to={`/students/${student.id}`} className="hover:text-blue-600 transition-colors" title="View Profile"><Eye size={18} /></Link>
                          <Link to={`/edit-student/${student.id}`} className="hover:text-indigo-600 transition-colors" title="Edit Student"><Edit size={18} /></Link>
                          <button onClick={() => handleDelete(student.id, `${student.first_name} ${student.last_name}`)} className="hover:text-red-600 transition-colors" title="Delete Student"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 italic">
                      No students found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentList;
