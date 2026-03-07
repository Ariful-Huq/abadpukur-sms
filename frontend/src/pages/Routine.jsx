import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/axios'; // Your axios instance
import { Clock, User, BookOpen, X, Save, Edit3, Coffee, Loader2, Plus } from 'lucide-react';

const Routine = () => {
  const [grades, setGrades] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [routineData, setRoutineData] = useState({}); // { "day-slot": { subject, teacher_id, teacher_name } }
  
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeEdit, setActiveEdit] = useState(null);

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
  const dayMap = { "Sunday": 0, "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4 };

  // 1. Initial Load: Get Grades and Teachers for the dropdowns
  useEffect(() => {
    const fetchBaseData = async () => {
      const [gradeRes, teacherRes] = await Promise.all([
        api.get('grades/'),
        api.get('teachers/')
      ]);
      setGrades(gradeRes.data);
      setTeachers(teacherRes.data);
    };
    fetchBaseData();
  }, []);

  // 2. Load Routine when Grade changes
  useEffect(() => {
    if (selectedGrade) {
      setLoading(true);
      api.get(`routine/?grade=${selectedGrade}`).then(res => {
        const mapped = {};
        res.data.forEach(item => {
          // We find the day name by its index
          const dayName = days.find(d => dayMap[d] === item.day);
          mapped[`${dayName}-${item.slot_number}`] = {
            subject: item.subject,
            teacher_id: item.teacher,
            teacher_name: item.teacher_name
          };
        });
        setRoutineData(mapped);
        setLoading(false);
      });
    }
  }, [selectedGrade]);

  const timeSlots = useMemo(() => {
    const slots = [];
    let currentTime = new Date();
    currentTime.setHours(10, 0, 0);
    let periodCount = 1;

    // First Half
    while (currentTime.getHours() < 13) {
      const start = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      currentTime.setMinutes(currentTime.getMinutes() + 45);
      const end = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      slots.push({ time: `${start} - ${end}`, type: 'class', label: `Period ${periodCount++}`, slotNum: periodCount - 1 });
    }
    // Tiffin
    slots.push({ time: "01:00 PM - 02:00 PM", type: 'break', label: 'Tiffin' });
    // Second Half
    currentTime.setHours(14, 0, 0);
    while (currentTime.getHours() < 16) {
      const start = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      currentTime.setMinutes(currentTime.getMinutes() + 40);
      const end = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      slots.push({ time: `${start} - ${end}`, type: 'class', label: `Period ${periodCount++}`, slotNum: periodCount - 1 });
    }
    return slots;
  }, []);

  const saveSlot = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const teacherId = formData.get('teacher');
    const subject = formData.get('subject');

    const payload = {
      grade: selectedGrade,
      day: dayMap[activeEdit.day],
      slot_number: activeEdit.slotNum,
      subject: subject,
      teacher: teacherId
    };

    try {
      await api.post('routine/', payload);
      // Refresh local state
      const teacherObj = teachers.find(t => t.id == teacherId);
      setRoutineData(prev => ({
        ...prev,
        [`${activeEdit.day}-${activeEdit.slotNum}`]: {
          subject,
          teacher_id: teacherId,
          teacher_name: `${teacherObj.first_name} ${teacherObj.last_name}`
        }
      }));
      setIsEditModalOpen(false);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Conflict: Teacher is already assigned elsewhere!";
      alert(errorMsg);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            <Clock className="text-indigo-600" /> Academic Routine
          </h1>
        </div>
        <select 
          className="p-3 border-2 border-gray-100 rounded-2xl w-64 font-bold outline-none focus:border-indigo-500 transition-all"
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
        >
          <option value="">Select Grade & Section</option>
          {grades.map(g => (
            <option key={g.id} value={g.id}>{g.name} - {g.section}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <Loader2 className="animate-spin mb-2" size={32} />
          <p className="font-bold">Fetching routine...</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-indigo-600 text-white">
                  {/* Added border-b-2 border-indigo-700 to create the separation */}
                  <th className="p-5 text-left font-black text-xs w-32 uppercase border-r border-b-2 border-indigo-700">Day</th>
                  {timeSlots.map((slot, i) => (
                    <th key={i} className="p-4 text-center min-w-[160px] border-r border-b-2 border-indigo-700 last:border-r-0">
                      <div className="text-[10px] font-black uppercase opacity-80">{slot.label}</div>
                      <div className="text-xs font-bold">{slot.time}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {days.map((day) => (
                  <tr key={day} className="border-b border-gray-100 last:border-0">
                    <td className="p-5 border-r border-b border-gray-100 font-black text-gray-600 bg-gray-50/50 uppercase text-xs italic">
                      {day}
                    </td>
                    {timeSlots.map((slot, i) => {
                      const cellKey = `${day}-${slot.slotNum}`;
                      const cellData = routineData[cellKey];

                      if (slot.type === 'break') {
                        return (
                          <td key={i} className="bg-amber-50/50 border-r border-b border-gray-100 text-center">
                            <Coffee size={18} className="mx-auto text-amber-300" />
                          </td>
                        );
                      }

                      return (
                        <td 
                          key={i} 
                          onClick={() => {
                            if (selectedGrade) {
                              setActiveEdit({ day, ...slot, ...cellData });
                              setIsEditModalOpen(true);
                            }
                          }}
                          className={`p-3 border-r border-b border-gray-100 text-center cursor-pointer hover:bg-indigo-50/50 transition-all relative group min-h-[80px] ${!selectedGrade ? 'cursor-not-allowed opacity-30' : ''}`}
                        >
                          {cellData ? (
                            <div>
                              <div className="text-sm font-black text-indigo-900 leading-tight">{cellData.subject}</div>
                              <div className="text-[10px] font-bold text-gray-400 flex items-center justify-center gap-1">
                                <User size={10} /> {cellData.teacher_name}
                              </div>
                            </div>
                          ) : (
                            <Plus size={16} className="mx-auto text-gray-200 opacity-0 group-hover:opacity-100" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
              <h2 className="text-xl font-black">Assign Period</h2>
              <button onClick={() => setIsEditModalOpen(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={saveSlot} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Subject</label>
                <input name="subject" defaultValue={activeEdit?.subject} required placeholder="e.g. Physics" className="w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-indigo-500 font-bold" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Teacher</label>
                <select name="teacher" defaultValue={activeEdit?.teacher_id} required className="w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-indigo-500 font-bold">
                  <option value="">Select Teacher</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.first_name} {t.last_name} ({t.subject})</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg flex items-center justify-center gap-2">
                <Save size={18} /> Update Routine
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Routine;
