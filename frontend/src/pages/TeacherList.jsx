import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { UserPlus, Mail, Phone, Edit, Trash2, Loader2, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const TeacherList = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await api.get('teachers/');
        setTeachers(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchTeachers();
  }, []);

  
  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove ${name} from the faculty?`)) {
      try {
        await api.delete(`teachers/${id}/`);
        // Remove from UI immediately
        setTeachers(teachers.filter(t => t.id !== id));
      } catch (err) {
        console.error("Delete failed:", err);
        alert("Could not delete teacher. They might be assigned to a Grade.");
      }
    }
  };


  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto" /></div>;


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Faculty Directory</h1>
        <Link to="/add-teacher" className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <UserPlus size={18} /> Add Teacher
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map(teacher => (
          <div key={teacher.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
                <Award size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">{teacher.first_name} {teacher.last_name}</h3>
                <p className="text-sm text-indigo-600 font-medium">{teacher.subject}</p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-2"><Mail size={14} /> {teacher.email}</div>
              <div className="flex items-center gap-2"><Phone size={14} /> {teacher.phone}</div>
            </div>

            <div className="flex border-t pt-4 justify-between">
               <span className={`text-xs px-2 py-1 rounded-full ${teacher.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                 {teacher.is_active ? 'Active' : 'On Leave'}
               </span>
               <div className="flex gap-3 text-gray-400">
                 <Link to={`/edit-teacher/${teacher.id}`} className="hover:text-indigo-600"><Edit size={16} /></Link>
                 <button onClick={() => handleDelete(teacher.id, `${teacher.first_name} ${teacher.last_name}`)} className="hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherList;
