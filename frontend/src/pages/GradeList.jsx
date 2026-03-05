import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, School, Trash2, Loader2, User } from 'lucide-react';

const GradeList = () => {
  const [grades, setGrades] = useState([]);
  const [teachers, setTeachers] = useState([]); // To assign a Class Teacher
  const [loading, setLoading] = useState(true);
  const [newGrade, setNewGrade] = useState({ name: '', section: '', teacher: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gradeRes, teacherRes] = await Promise.all([
          api.get('grades/'),
          api.get('teachers/')
        ]);
        setGrades(gradeRes.data.results || gradeRes.data);
        setTeachers(teacherRes.data.results || teacherRes.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleAddGrade = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('grades/', newGrade);
      setGrades([...grades, res.data]);
      setNewGrade({ name: '', section: '', teacher: '' });
    } catch (err) { alert("Error creating grade. Check if it already exists."); }
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Creation Form */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-fit">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Plus size={20}/> New Grade</h2>
        <form onSubmit={handleAddGrade} className="space-y-4">
          <input className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50" 
            placeholder="Grade Name (e.g. Grade 10)" value={newGrade.name} required
            onChange={e => setNewGrade({...newGrade, name: e.target.value})} />
          
          <input className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50" 
            placeholder="Section (e.g. A)" value={newGrade.section} required
            onChange={e => setNewGrade({...newGrade, section: e.target.value})} />

          <select className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
            value={newGrade.teacher} onChange={e => setNewGrade({...newGrade, teacher: e.target.value})}>
            <option value="">Select Class Teacher</option>
            {teachers.map(t => (
              <option key={t.id} value={t.id}>{t.first_name} {t.last_name} ({t.subject})</option>
            ))}
          </select>

          <button className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition">
            Create Grade
          </button>
        </form>
      </div>

      {/* Grade List Display */}
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        {grades.map(grade => (
          <div key={grade.id} className="bg-white p-5 rounded-2xl border border-gray-100 flex justify-between items-center group hover:border-indigo-200 transition">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600"><School size={24}/></div>
              <div>
                <h3 className="font-bold text-lg">{grade.name} - {grade.section}</h3>
                <p className="text-xs text-gray-400">Teacher ID: {grade.teacher || 'None'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GradeList;
