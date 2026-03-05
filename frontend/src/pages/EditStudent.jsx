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
        
        // Destructure to separate the photo URL from the rest of the form data
        const { photo, ...rest } = studentRes.data;
        setFormData({ ...rest, photo: null }); // photo stays null unless a new file is picked
        
        if (photo) {
          setPreviewUrl(photo); 
        }
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
        if (formData[key] instanceof File) {
          // If a new file was picked
          data.append(key, formData[key]);
        } else if (formData[key] === 'clear') {
          // If the user clicked "Remove Photo", we send an empty string or null 
          // depending on what your Django/Backend expects to clear a FileField
          data.append(key, ""); 
        }
        // If photo is null (default), we don't append it, so the backend keeps the old photo
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

  if (loading) return (
    <div className="p-20 text-center flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="text-gray-500 font-medium">Loading student profile...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 pb-10">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/students')} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-bold transition">
          <ArrowLeft size={20} /> Back to Directory
        </button>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800"><UserCheck className="text-indigo-600"/> Edit Student</h1>
        <div className="w-10"></div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Photo Upload & Remove Section */}
        <div className="md:col-span-2 flex flex-col items-center mb-4">
          <div className="relative group">
            <div className="w-32 h-32 bg-gray-50 rounded-full border-4 border-white shadow-md flex items-center justify-center overflow-hidden ring-1 ring-gray-100">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-gray-300" />
              )}
            </div>
    
            {/* Upload Button */}
            <label className="absolute bottom-1 right-1 bg-indigo-600 text-white p-2.5 rounded-full cursor-pointer shadow-lg hover:bg-indigo-700 hover:scale-110 transition-all border-2 border-white">
              <Camera size={18} />
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>

            {/* Remove Photo Button - Only shows if there is a photo */}
            {previewUrl && (
              <button
                type="button"
                onClick={() => {
                  setPreviewUrl(null);
                  setFormData({ ...formData, photo: 'clear' }); // Using 'clear' as a flag
                }}
                className="absolute -top-1 -right-1 bg-rose-500 text-white p-1.5 rounded-full shadow-md hover:bg-rose-600 hover:scale-110 transition-all border-2 border-white"
                title="Remove Photo"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <span className="text-[10px] font-black text-gray-400 uppercase mt-3 tracking-[0.2em]">
            {previewUrl ? "Change or Remove Photo" : "Upload Student Photo"}
          </span>
        </div>

        {/* Status Toggle */}
        <div className="md:col-span-2 flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
           <div className="flex flex-col">
             <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Account Status</label>
             <p className="text-sm text-gray-600">Active students appear in attendance sheets</p>
           </div>
           <select 
             className={`p-2 px-4 rounded-xl font-bold border outline-none transition-colors ${formData.is_active ? 'bg-green-100 border-green-200 text-green-700' : 'bg-red-100 border-red-200 text-red-700'}`} 
             value={formData.is_active} 
             onChange={(e) => setFormData({...formData, is_active: e.target.value === 'true'})}
           >
             <option value="true">Active</option>
             <option value="false">Inactive</option>
           </select>
        </div>

        <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">First Name</label>
            <input placeholder="Ex: John" required className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} />
        </div>

        <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Last Name</label>
            <input placeholder="Ex: Doe" required className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} />
        </div>

        <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Registration ID (Locked)</label>
            <input placeholder="ID Number" readOnly className="w-full p-3 border rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed outline-none" value={formData.registration_number} />
        </div>
        
        <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Assigned Grade</label>
            <select required className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white" value={formData.grade} onChange={(e) => setFormData({...formData, grade: e.target.value})}>
              <option value="">Select Grade</option>
              {grades.map(g => <option key={g.id} value={g.id}>{g.name} - {g.section}</option>)}
            </select>
        </div>

        <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Birth Date</label>
            <input type="date" required className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white" value={formData.date_of_birth} onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})} />
        </div>

        <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Gender</label>
            <select className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
        </div>

        <div className="md:col-span-2 border-t border-dashed pt-4 mt-2">
            <h3 className="font-black text-gray-400 uppercase text-[10px] tracking-widest mb-4">Guardian & Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input placeholder="Parent/Guardian Name" required className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" value={formData.parent_name} onChange={(e) => setFormData({...formData, parent_name: e.target.value})} />
                <input placeholder="Primary Phone Number" required className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" value={formData.parent_phone} onChange={(e) => setFormData({...formData, parent_phone: e.target.value})} />
                <textarea placeholder="Residential Address" required className="p-3 border rounded-xl md:col-span-2 outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
            </div>
        </div>

        <div className="md:col-span-2 pt-4">
            <button type="submit" disabled={saving} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 flex justify-center items-center gap-2 transition-all shadow-xl shadow-indigo-100 disabled:bg-gray-300 disabled:shadow-none">
              {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} Update Student Profile
            </button>
        </div>
      </form>
    </div>
  );
};

export default EditStudent;
