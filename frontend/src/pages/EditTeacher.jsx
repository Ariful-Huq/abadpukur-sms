import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Save, ArrowLeft, Loader2, Camera, User } from 'lucide-react';

const EditTeacher = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', phone: '', subject: '', is_active: true, photo: null
  });

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const res = await api.get(`teachers/${id}/`);
        const { photo, ...rest } = res.data;
        setFormData({ ...rest, photo: null });
        if (photo) setPreviewUrl(photo);
      } catch (err) { alert("Teacher not found"); navigate('/teachers'); }
      finally { setLoading(false); }
    };
    fetchTeacher();
  }, [id, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, photo: file });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'photo') {
        if (formData[key] instanceof File) data.append(key, formData[key]);
      } else {
        data.append(key, formData[key]);
      }
    });

    try {
      await api.put(`teachers/${id}/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/teachers');
    } catch (err) { alert("Update failed. Check email uniqueness."); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border shadow-sm">
      <button onClick={() => navigate('/teachers')} className="flex items-center gap-2 text-gray-500 mb-6 hover:text-indigo-600 font-medium">
        <ArrowLeft size={20} /> Back to Faculty
      </button>
      
      <div className="flex flex-col items-center mb-8">
        <div className="relative group">
          <div className="w-24 h-24 bg-gray-50 rounded-full border-2 border-indigo-100 flex items-center justify-center overflow-hidden">
            {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" alt="Profile" /> : <User size={30} className="text-gray-300" />}
          </div>
          <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1.5 rounded-full cursor-pointer shadow-md hover:scale-110 transition">
            <Camera size={14} /><input type="file" className="hidden" onChange={handleFileChange} />
          </label>
        </div>
        <h1 className="text-xl font-bold mt-4">Edit: {formData.first_name} {formData.last_name}</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-2 gap-4">
          <input className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" value={formData.first_name} placeholder="First Name"
            onChange={e => setFormData({...formData, first_name: e.target.value})} />
          <input className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" value={formData.last_name} placeholder="Last Name"
            onChange={e => setFormData({...formData, last_name: e.target.value})} />
        </div>
        
        <input className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" value={formData.email} placeholder="Email"
          onChange={e => setFormData({...formData, email: e.target.value})} />
        <input className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" value={formData.phone} placeholder="Phone"
          onChange={e => setFormData({...formData, phone: e.target.value})} />
        <input className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" value={formData.subject} placeholder="Subject"
          onChange={e => setFormData({...formData, subject: e.target.value})} />
        
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
          <label className="text-sm font-semibold text-gray-600">Status:</label>
          <select className="bg-transparent text-sm outline-none" value={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.value === 'true'})}>
            <option value="true">Active</option>
            <option value="false">On Leave</option>
          </select>
        </div>

        <button type="submit" disabled={saving} className="bg-indigo-600 text-white py-4 rounded-xl font-bold flex justify-center gap-2 hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">
          {saving ? <Loader2 className="animate-spin" /> : <Save />} Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditTeacher;
