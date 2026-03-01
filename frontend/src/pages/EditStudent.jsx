import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Save, X, UserCheck, Loader2, ArrowLeft } from 'lucide-react';

const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', registration_number: '',
    gender: 'M', grade: '', date_of_birth: '',
    parent_name: '', parent_phone: '', address: '', is_active: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Grades and Student Data in parallel
        const [gradesRes, studentRes] = await Promise.all([
          api.get('grades/'),
          api.get(`students/${id}/`)
        ]);
        setGrades(gradesRes.data);
        setFormData(studentRes.data);
      } catch (err) {
        console.error("Error loading data:", err);
        alert("Could not load student data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Use PUT for updating existing records
      await api.put(`students/${id}/`, formData);
      navigate('/students'); 
    } catch (error) {
      console.error(error.response?.data);
      alert("Update failed. Check if Registration ID is unique.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/students')} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600">
          <ArrowLeft size={20} /> Back
        </button>
        <h1 className="text-2xl font-bold flex items-center gap-2"><UserCheck /> Edit Student Profile</h1>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2 flex items-center gap-4 bg-indigo-50 p-4 rounded-lg mb-2">
           <label className="text-sm font-bold text-indigo-900">Account Status:</label>
           <select 
             className="p-1 rounded border border-indigo-200"
             value={formData.is_active}
             onChange={(e) => setFormData({...formData, is_active: e.target.value === 'true'})}
           >
             <option value="true">Active</option>
             <option value="false">Inactive</option>
           </select>
        </div>

        <input placeholder="First Name" required className="p-3 border rounded-lg" value={formData.first_name}
          onChange={(e) => setFormData({...formData, first_name: e.target.value})} />
        
        <input placeholder="Last Name" required className="p-3 border rounded-lg" value={formData.last_name}
          onChange={(e) => setFormData({...formData, last_name: e.target.value})} />
        
        <input placeholder="Registration ID" required className="p-3 border rounded-lg bg-gray-50" value={formData.registration_number}
          onChange={(e) => setFormData({...formData, registration_number: e.target.value})} />
        
        <select required className="p-3 border rounded-lg" value={formData.grade}
          onChange={(e) => setFormData({...formData, grade: e.target.value})}>
          <option value="">Select Grade</option>
          {grades.map(g => (
            <option key={g.id} value={g.id}>{g.name} - {g.section}</option>
          ))}
        </select>

        <input type="date" required className="p-3 border rounded-lg" value={formData.date_of_birth}
          onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})} />
        
        <select className="p-3 border rounded-lg" value={formData.gender}
          onChange={(e) => setFormData({...formData, gender: e.target.value})}>
          <option value="M">Male</option>
          <option value="F">Female</option>
        </select>

        <div className="md:col-span-2 border-t pt-4 font-bold text-gray-700">Guardian Info</div>
        
        <input placeholder="Parent Name" required className="p-3 border rounded-lg" value={formData.parent_name}
          onChange={(e) => setFormData({...formData, parent_name: e.target.value})} />
        
        <input placeholder="Parent Phone" required className="p-3 border rounded-lg" value={formData.parent_phone}
          onChange={(e) => setFormData({...formData, parent_phone: e.target.value})} />
        
        <textarea placeholder="Full Address" required className="p-3 border rounded-lg md:col-span-2" value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})} />

        <button type="submit" disabled={saving} className="md:col-span-2 bg-indigo-600 text-white py-4 rounded-lg font-bold hover:bg-indigo-700 flex justify-center gap-2">
          {saving ? <Loader2 className="animate-spin" /> : <Save />} Update Student Record
        </button>
      </form>
    </div>
  );
};

export default EditStudent;
