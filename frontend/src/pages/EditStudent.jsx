import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Save, X, UserCheck, Loader2, ArrowLeft, Camera, User } from 'lucide-react';

const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', registration_number: '',
    gender: 'M', grade: '', date_of_birth: '',
    parent_name: '', parent_phone: '', address: '', 
    is_active: true, photo: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gradesRes, studentRes] = await Promise.all([
          api.get('grades/'),
          api.get(`students/${id}/`)
        ]);
        setGrades(gradesRes.data);
        const { photo, ...rest } = studentRes.data;
        setFormData({ ...rest, photo: null }); 
        if (photo) setPreviewUrl(photo); 
      } catch (err) {
        console.error("Error loading data:", err);
      } finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

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
      await api.put(`students/${id}/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/students'); 
    } catch (error) {
      console.error(error.response?.data);
      alert("Update failed.");
    } finally { setSaving(false); }
  };

  if (loading) return <div className="p-10 text-center flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto p-4 pb-10">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/students')} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-bold">
          <ArrowLeft size={20} /> Back
        </button>
        <h1 className="text-2xl font-bold flex items-center gap-2"><UserCheck /> Edit Student Profile</h1>
        <div className="w-10"></div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2 flex flex-col items-center mb-4">
          <div className="relative group">
            <div className="w-28 h-28 bg-gray-50 rounded-full border-2 border-indigo-100 flex items-center justify-center overflow-hidden">
              {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" /> : <User size={40} className="text-gray-300" />}
            </div>
            <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer shadow-lg hover:scale-110 transition">
              <Camera size={16} /><input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase mt-2 tracking-widest">Change Photo</span>
        </div>

        <div className="md:col-span-2 flex items-center gap-4 bg-indigo-50 p-4 rounded-lg mb-2">
           <label className="text-sm font-bold text-indigo-900">Account Status:</label>
           <select className="p-1 rounded border border-indigo-200 outline-none" value={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.value === 'true'})}>
             <option value="true">Active</option><option value="false">Inactive</option>
           </select>
        </div>

        <input placeholder="First Name" required className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} />
        <input placeholder="Last Name" required className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} />
        <input placeholder="Registration ID" required className="p-3 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.registration_number} onChange={(e) => setFormData({...formData, registration_number: e.target.value})} />
        
        <select required className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" value={formData.grade} onChange={(e) => setFormData({...formData, grade: e.target.value})}>
          <option value="">Select Grade</option>
          {grades.map(g => <option key={g.id} value={g.id}>{g.name} - {g.section}</option>)}
        </select>

        <input type="date" required className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" value={formData.date_of_birth} onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})} />
        <select className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
          <option value="M">Male</option><option value="F">Female</option>
        </select>

        <div className="md:col-span-2 border-t pt-4 font-bold text-gray-700 uppercase text-xs">Guardian Info</div>
        <input placeholder="Parent Name" required className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" value={formData.parent_name} onChange={(e) => setFormData({...formData, parent_name: e.target.value})} />
        <input placeholder="Parent Phone" required className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" value={formData.parent_phone} onChange={(e) => setFormData({...formData, parent_phone: e.target.value})} />
        <textarea placeholder="Full Address" required className="p-3 border rounded-lg md:col-span-2 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />

        <button type="submit" disabled={saving} className="md:col-span-2 bg-indigo-600 text-white py-4 rounded-lg font-bold hover:bg-indigo-700 flex justify-center items-center gap-2 transition shadow-lg shadow-indigo-100">
          {saving ? <Loader2 className="animate-spin" /> : <Save size={18} />} Update Student Record
        </button>
      </form>
    </div>
  );
};

export default EditStudent;
