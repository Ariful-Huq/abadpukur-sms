import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Save, X, UserPlus, Loader2 } from 'lucide-react';

const AddStudent = () => {
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', registration_number: '',
    gender: 'M', grade: '', date_of_birth: '',
    parent_name: '', parent_phone: '', address: ''
  });
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('students/', formData);
      console.log("Success:", response.data);
      navigate('/students'); 
    } catch (error) {
      // This will print the EXACT field that is failing in your browser console (F12)
      console.error("Server Error Details:", error.response?.data);
      
      const serverMessage = error.response?.data 
        ? Object.entries(error.response.data).map(([field, msg]) => `${field}: ${msg}`).join('\n')
        : "Unknown Error";
        
      alert("Submission Failed:\n" + serverMessage);
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><UserPlus /> Enroll Student</h1>
        <button onClick={() => navigate('/students')} className="text-gray-500"><X /></button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Row 1 */}
        <input placeholder="First Name" required className="p-3 border rounded-lg"
          onChange={(e) => setFormData({...formData, first_name: e.target.value})} />
        <input placeholder="Last Name" required className="p-3 border rounded-lg"
          onChange={(e) => setFormData({...formData, last_name: e.target.value})} />
        
        {/* Row 2 */}
        <input placeholder="Registration ID" required className="p-3 border rounded-lg"
          onChange={(e) => setFormData({...formData, registration_number: e.target.value})} />
        
        {/* Grade Dropdown */}
        <select required className="p-3 border rounded-lg" value={formData.grade}
          onChange={(e) => setFormData({...formData, grade: e.target.value})}>
          <option value="">Select Grade</option>
          {grades.map(g => (
            <option key={g.id} value={g.id}>{g.name} - {g.section}</option>
          ))}
        </select>

        {/* Row 3 */}
        <input type="date" required className="p-3 border rounded-lg"
          value={formData.date_of_birth}
          onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})} />
        <select className="p-3 border rounded-lg" onChange={(e) => setFormData({...formData, gender: e.target.value})}>
          <option value="M">Male</option>
          <option value="F">Female</option>
        </select>

        <div className="md:col-span-2 border-t pt-4 font-bold text-gray-700">Guardian Info</div>
        
        <input placeholder="Parent Name" required className="p-3 border rounded-lg"
          onChange={(e) => setFormData({...formData, parent_name: e.target.value})} />
        <input placeholder="Parent Phone" required className="p-3 border rounded-lg"
          onChange={(e) => setFormData({...formData, parent_phone: e.target.value})} />
        <textarea placeholder="Full Address" required className="p-3 border rounded-lg md:col-span-2"
          onChange={(e) => setFormData({...formData, address: e.target.value})} />

        <button type="submit" disabled={loading} className="md:col-span-2 bg-indigo-600 text-white py-4 rounded-lg font-bold hover:bg-indigo-700 flex justify-center gap-2">
          {loading ? <Loader2 className="animate-spin" /> : <Save />} Save Record
        </button>
      </form>
    </div>
  );
};

export default AddStudent;
