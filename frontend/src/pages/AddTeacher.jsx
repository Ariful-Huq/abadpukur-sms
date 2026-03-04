import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Save, X, UserPlus, Loader2, Mail, Phone, BookOpen, Camera, User } from 'lucide-react';

const AddTeacher = () => {
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '',
    phone: '', subject: '', is_active: true, photo: null
  });
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, photo: file });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null) {
        data.append(key, formData[key]);
      }
    });

    try {
      await api.post('teachers/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/teachers'); 
    } catch (error) {
      console.error(error.response?.data);
      alert("Error: Ensure email is unique and photo is a valid image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <UserPlus className="text-indigo-600" /> Register New Teacher
        </h1>
        <button onClick={() => navigate('/teachers')} className="text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Photo Upload Section */}
        <div className="md:col-span-2 flex flex-col items-center mb-4">
          <div className="relative group">
            <div className="w-28 h-28 bg-gray-50 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
              {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" /> : <User size={40} className="text-gray-300" />}
            </div>
            <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform">
              <Camera size={16} />
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase mt-2">Upload Profile Photo</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">First Name</label>
          <input required type="text" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={(e) => setFormData({...formData, first_name: e.target.value})} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Last Name</label>
          <input required type="text" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={(e) => setFormData({...formData, last_name: e.target.value})} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Mail size={14}/> Email Address</label>
          <input required type="email" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={(e) => setFormData({...formData, email: e.target.value})} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Phone size={14}/> Phone Number</label>
          <input required type="text" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={(e) => setFormData({...formData, phone: e.target.value})} />
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><BookOpen size={14}/> Primary Subject</label>
          <input required type="text" placeholder="e.g. Mathematics, Physics, English" 
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={(e) => setFormData({...formData, subject: e.target.value})} />
        </div>

        <button type="submit" disabled={loading} className="md:col-span-2 mt-4 bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 flex justify-center items-center gap-2 transition-all shadow-lg shadow-indigo-100">
          {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />} 
          Confirm Registration
        </button>
      </form>
    </div>
  );
};

export default AddTeacher;
