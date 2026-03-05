import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { UserPlus, Mail, Phone, Edit, Trash2, Loader2, User, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const TeacherList = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await api.get('teachers/');
        if (res.data.results) {
          setTeachers(res.data.results);
        } else {
          setTeachers(res.data);
        }
      } catch (err) {
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove ${name} from the faculty?`)) {
      try {
        await api.delete(`teachers/${id}/`);
        setTeachers(teachers.filter(t => t.id !== id));
      } catch (err) {
        alert("Action restricted: This teacher is still assigned to a Grade/Class.");
      }
    }
  };

  if (loading) return (
    <div className="p-20 text-center flex flex-col items-center gap-4">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
      <p className="text-gray-500 font-medium">Fetching Faculty Members...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Faculty Directory</h1>
          <p className="text-sm text-gray-500 font-medium">Managing {teachers.length} active educators</p>
        </div>
        <Link to="/add-teacher" className="bg-indigo-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:scale-105 transition-all font-bold">
          <UserPlus size={20} /> Add Faculty
        </Link>
      </div>

      {teachers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map(teacher => (
            <div key={teacher.id} className="bg-white p-6 rounded-3xl border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:scale-110 transition-transform">
                  {teacher.photo ? (
                    <img src={teacher.photo} className="w-full h-full object-cover" alt={teacher.first_name} />
                  ) : (
                    <User size={28} className="text-indigo-300" />
                  )}
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-bold text-lg text-gray-800 truncate leading-tight">{teacher.first_name} {teacher.last_name}</h3>
                  <p className="text-xs text-indigo-600 font-black uppercase tracking-wider mt-1">{teacher.subject}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600 mb-6 bg-gray-50/50 p-4 rounded-2xl">
                <div className="flex items-center gap-3"><Mail size={14} className="text-gray-400"/> <span className="truncate">{teacher.email}</span></div>
                <div className="flex items-center gap-3"><Phone size={14} className="text-gray-400"/> {teacher.phone}</div>
              </div>

              {/* Displaying Assigned Grades */}
              <div className="mb-6 px-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-3">Class Assignments</p>
                <div className="flex flex-wrap gap-2">
                  {teacher.assigned_grades && teacher.assigned_grades.length > 0 ? (
                    teacher.assigned_grades.map((grade, idx) => (
                      <span key={idx} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-[10px] font-bold border border-indigo-100">
                        {grade}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-gray-400 italic">Unassigned</span>
                  )}
                </div>
              </div>

              <div className="flex border-t border-gray-50 pt-4 justify-between items-center">
                 <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${teacher.is_active ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>
                   {teacher.is_active ? '● Active' : '● On Leave'}
                 </span>
                 <div className="flex gap-4 text-gray-300">
                   <Link to={`/edit-teacher/${teacher.id}`} className="hover:text-indigo-600 transition-colors"><Edit size={18} /></Link>
                   <button onClick={() => handleDelete(teacher.id, `${teacher.first_name} ${teacher.last_name}`)} className="hover:text-rose-500 transition-colors"><Trash2 size={18} /></button>
                 </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 text-center">
          <BookOpen size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-400 font-medium">No faculty members found.</p>
          <Link to="/add-teacher" className="text-indigo-600 text-sm font-bold mt-2 inline-block hover:underline">Register your first teacher</Link>
        </div>
      )}
    </div>
  );
};

export default TeacherList;
