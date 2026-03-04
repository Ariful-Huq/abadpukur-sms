import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Save, X, UserPlus, Loader2, Camera, User } from 'lucide-react';

const AddStudent = () => {
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', registration_number: '',
    gender: 'M', grade: '', date_of_birth: '',
    parent_name: '', parent_phone: '', address: '',
    photo: null
  });
  
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const response = await api.get('grades/');
        setGrades(response.data);
      } catch (err) { console.error("Could not load grades", err); }
    };
    fetchGrades();
  }, []);

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
      await api.post('students/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/students'); 
    } catch (error) {
      console.error(error.response?.data);
      alert("Submission Failed: Check console for details.");
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 pb-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><UserPlus /> Enroll Student</h1>
        <button onClick={() => navigate('/students')} className="text-gray-500 hover:text-red-500 transition"><X /></button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2 flex flex-col items-center mb-4">
          <div className="relative group">
            <div className="w-28 h-28 bg-gray-50 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
              {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" /> : <User size={40} className="text-gray-300" />}
            </div>
            <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer shadow-lg transition-transform hover:scale-110">
              <Camera size={16} /><input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase mt-2">Upload Student Photo</span>
        </div>

        <input placeholder="First Name" required className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
          onChange={(e) => setFormData({...formData, first_name: e.target.value})} />
        <input placeholder="Last Name" required className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
          onChange={(e) => setFormData({...formData, last_name: e.target.value})} />
        <input placeholder="Registration ID" required className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
          onChange={(e) => setFormData({...formData, registration_number: e.target.value})} />
        
        <select required className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
          onChange={(e) => setFormData({...formData, grade: e.target.value})}>
          <option value="">Select Grade</option>
          {grades.map(g => <option key={g.id} value={g.id}>{g.name} - {g.section}</option>)}
        </select>

        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Date of Birth</label>
          <input type="date" required className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})} />
        </div>
        
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Gender</label>
          <select className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" onChange={(e) => setFormData({...formData, gender: e.target.value})}>
            <option value="M">Male</option><option value="F">Female</option>
          </select>
        </div>

        <div className="md:col-span-2 border-t pt-4 font-bold text-gray-700 uppercase text-xs tracking-widest">Guardian Info</div>
        <input placeholder="Parent Name" required className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" onChange={(e) => setFormData({...formData, parent_name: e.target.value})} />
        <input placeholder="Parent Phone" required className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" onChange={(e) => setFormData({...formData, parent_phone: e.target.value})} />
        <textarea placeholder="Full Address" required className="p-3 border rounded-lg md:col-span-2 outline-none focus:ring-2 focus:ring-indigo-500" onChange={(e) => setFormData({...formData, address: e.target.value})} />

        <button type="submit" disabled={loading} className="md:col-span-2 bg-indigo-600 text-white py-4 rounded-lg font-bold hover:bg-indigo-700 flex justify-center items-center gap-2 transition shadow-lg">
          {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />} Save Record
        </button>
      </form>
    </div>
  );
};

export default AddStudent;
