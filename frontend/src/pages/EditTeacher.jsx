import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';

const EditTeacher = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', phone: '', subject: '', is_active: true
  });

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const res = await api.get(`teachers/${id}/`);
        setFormData(res.data);
      } catch (err) { alert("Teacher not found"); navigate('/teachers'); }
      finally { setLoading(false); }
    };
    fetchTeacher();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`teachers/${id}/`, formData);
      navigate('/teachers');
    } catch (err) { alert("Update failed. Check if email is unique."); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border shadow-sm">
      <button onClick={() => navigate('/teachers')} className="flex items-center gap-2 text-gray-500 mb-6 hover:text-indigo-600">
        <ArrowLeft size={20} /> Back to Faculty
      </button>
      <h1 className="text-2xl font-bold mb-6">Edit Teacher: {formData.first_name}</h1>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
        <input className="p-3 border rounded-lg" value={formData.first_name} placeholder="First Name"
          onChange={e => setFormData({...formData, first_name: e.target.value})} />
        <input className="p-3 border rounded-lg" value={formData.last_name} placeholder="Last Name"
          onChange={e => setFormData({...formData, last_name: e.target.value})} />
        <input className="p-3 border rounded-lg" value={formData.email} placeholder="Email"
          onChange={e => setFormData({...formData, email: e.target.value})} />
        <input className="p-3 border rounded-lg" value={formData.phone} placeholder="Phone"
          onChange={e => setFormData({...formData, phone: e.target.value})} />
        <input className="p-3 border rounded-lg" value={formData.subject} placeholder="Subject"
          onChange={e => setFormData({...formData, subject: e.target.value})} />
        
        <button type="submit" disabled={saving} className="bg-indigo-600 text-white py-3 rounded-lg font-bold flex justify-center gap-2">
          {saving ? <Loader2 className="animate-spin" /> : <Save />} Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditTeacher;
