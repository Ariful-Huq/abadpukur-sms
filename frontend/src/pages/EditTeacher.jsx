import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Save, ArrowLeft, Loader2, Camera, User, X } from 'lucide-react';

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
      } catch (err) { 
        alert("Teacher not found"); 
        navigate('/teachers'); 
      } finally { setLoading(false); }
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

  const handleRemovePhoto = () => {
    setPreviewUrl(null);
    setFormData({ ...formData, photo: 'clear' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = new FormData();
    
    Object.keys(formData).forEach(key => {
      if (key === 'photo') {
        if (formData[key] instanceof File) {
          data.append(key, formData[key]);
        } else if (formData[key] === 'clear') {
          data.append(key, ""); // Backend catches "" to clear the image
        }
      } else {
        data.append(key, formData[key]);
      }
    });

    try {
      await api.put(`teachers/${id}/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/teachers');
    } catch (err) { 
      alert("Update failed. Check email uniqueness or network connection."); 
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="p-20 text-center flex flex-col items-center gap-4">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
      <p className="text-gray-500 font-medium">Loading teacher profile...</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-4 pb-10">
      <button onClick={() => navigate('/teachers')} className="flex items-center gap-2 text-gray-500 mb-6 hover:text-indigo-600 font-bold transition">
        <ArrowLeft size={20} /> Back to Faculty
      </button>

      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            <div className="w-28 h-28 bg-gray-50 rounded-2xl border-4 border-white shadow-md flex items-center justify-center overflow-hidden ring-1 ring-gray-100">
              {previewUrl ? (
                <img src={previewUrl} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <User size={40} className="text-gray-300" />
              )}
            </div>
            
            <label className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-full cursor-pointer shadow-lg hover:scale-110 transition border-2 border-white">
              <Camera size={16} />
              <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
            </label>

            {previewUrl && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="absolute -top-2 -right-2 bg-rose-500 text-white p-1.5 rounded-full shadow-md hover:scale-110 transition border-2 border-white"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <h1 className="text-2xl font-bold mt-6 text-gray-800">Edit Faculty Member</h1>
          <p className="text-gray-400 text-sm">{formData.first_name} {formData.last_name}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">First Name</label>
              <input className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50" 
                value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Last Name</label>
              <input className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50" 
                value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} required />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Email Address</label>
            <input className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50" 
              value={formData.email} type="email" onChange={e => setFormData({...formData, email: e.target.value})} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Phone Number</label>
              <input className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50" 
                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Primary Subject</label>
              <input className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50" 
                value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} required />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
            <div>
              <label className="text-xs font-bold text-indigo-900 block">Employment Status</label>
              <p className="text-[11px] text-indigo-600">Toggle active status for faculty directory</p>
            </div>
            <select className={`p-2 px-4 rounded-xl font-bold border outline-none transition-colors ${formData.is_active ? 'bg-green-100 border-green-200 text-green-700' : 'bg-red-100 border-red-200 text-red-700'}`} 
              value={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.value === 'true'})}>
              <option value="true">Active</option>
              <option value="false">On Leave</option>
            </select>
          </div>

          <button type="submit" disabled={saving} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex justify-center items-center gap-2 hover:bg-indigo-700 transition shadow-xl shadow-indigo-100 disabled:bg-gray-300">
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} Update Teacher Record
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditTeacher;
