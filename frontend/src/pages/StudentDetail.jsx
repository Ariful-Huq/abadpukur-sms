import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, User, Phone, MapPin, Calendar, GraduationCap, Mail, CheckCircle, XCircle } from 'lucide-react';

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await api.get(`students/${id}/`);
        setStudent(response.data);
      } catch (error) {
        console.error("Error fetching student details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  if (loading) return <div className="p-10 text-center">Loading Profile...</div>;
  if (!student) return <div className="p-10 text-center text-red-500">Student not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button 
        onClick={() => navigate('/students')}
        className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition"
      >
        <ArrowLeft size={20} /> Back to Directory
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header/Banner */}
        <div className="bg-indigo-600 h-32 relative">
          <div className="absolute -bottom-12 left-8 bg-white p-2 rounded-2xl shadow-md">
            <div className="bg-indigo-100 w-24 h-24 rounded-xl flex items-center justify-center text-indigo-600 overflow-hidden border-2 border-white">
              {student.photo ? (
                <img 
                  src={student.photo} 
                  alt={`${student.first_name} profile`} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <User size={48} />
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-16 p-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{student.first_name} {student.last_name}</h1>
              <p className="text-gray-500 flex items-center gap-2">
                <GraduationCap size={16} /> {student.grade_name || 'Unassigned'} • ID: {student.registration_number}
              </p>
            </div>
            <span className={`px-4 py-1 rounded-full text-sm font-bold flex items-center gap-2 ${
              student.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {student.is_active ? <CheckCircle size={16} /> : <XCircle size={16} />}
              {student.is_active ? 'Active Enrollment' : 'Inactive'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            {/* Personal Info */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 border-b pb-2">Personal Information</h3>
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar size={18} className="text-indigo-500" />
                <span><strong>Date of Birth:</strong> {student.date_of_birth}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <User size={18} className="text-indigo-500" />
                <span><strong>Gender:</strong> {student.gender === 'M' ? 'Male' : 'Female'}</span>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 border-b pb-2">Guardian & Contact</h3>
              <div className="flex items-center gap-3 text-gray-600">
                <User size={18} className="text-indigo-500" />
                <span><strong>Parent:</strong> {student.parent_name}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Phone size={18} className="text-indigo-500" />
                <span><strong>Phone:</strong> {student.parent_phone}</span>
              </div>
              <div className="flex items-start gap-3 text-gray-600">
                <MapPin size={18} className="text-indigo-500 mt-1" />
                <span><strong>Address:</strong><br />{student.address}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;
