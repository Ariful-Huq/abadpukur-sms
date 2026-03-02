import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { CreditCard, Save, History, Landmark, Banknote } from 'lucide-react';

const Fees = () => {
  const [students, setStudents] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    student: '',
    fee_type: '',
    amount_paid: '',
    payment_method: 'CASH',
    status: 'COMPLETED',
    transaction_id: '',
    remarks: ''
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [sRes, fRes] = await Promise.all([
          api.get('students/'),
          api.get('fee-structures/')
        ]);
        setStudents(sRes.data);
        setFeeStructures(fRes.data);
      } catch (err) { console.error("Failed to load data", err); }
    };
    loadInitialData();
  }, []);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('fee-payments/', formData);
      alert("Payment Logged Successfully!");
      setFormData({ ...formData, student: '', amount_paid: '', transaction_id: '', remarks: '' });
    } catch (err) {
      alert("Error logging payment. Verify transaction ID is unique.");
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <CreditCard className="text-indigo-600" /> Student Fee Collection
      </h1>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <form onSubmit={handlePaymentSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-2">
            <label className="text-sm font-bold">Select Student</label>
            <select required className="w-full p-3 border rounded-xl"
              value={formData.student} onChange={e => setFormData({...formData, student: e.target.value})}>
              <option value="">Select Student...</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.registration_number})</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold">Fee Category</label>
            <select required className="w-full p-3 border rounded-xl"
              value={formData.fee_type} 
              onChange={e => {
                const selected = feeStructures.find(f => f.id === parseInt(e.target.value));
                setFormData({...formData, fee_type: e.target.value, amount_paid: selected ? selected.amount : ''});
              }}>
              <option value="">Select Fee Type...</option>
              {feeStructures.map(f => <option key={f.id} value={f.id}>{f.name} (৳{f.amount})</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold">Amount Paid (৳)</label>
            <input type="number" step="0.01" required className="w-full p-3 border rounded-xl"
              value={formData.amount_paid} onChange={e => setFormData({...formData, amount_paid: e.target.value})} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold">Payment Method</label>
            <select className="w-full p-3 border rounded-xl"
              value={formData.payment_method} onChange={e => setFormData({...formData, payment_method: e.target.value})}>
              <option value="CASH">Cash</option>
              <option value="MFS">bKash/Nagad (MFS)</option>
              <option value="Bank">Bank Transfer</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold">Transaction ID (Required for MFS/Bank)</label>
            <input type="text" className="w-full p-3 border rounded-xl" placeholder="TRX123456"
              value={formData.transaction_id} onChange={e => setFormData({...formData, transaction_id: e.target.value})} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold">Payment Status</label>
            <select className="w-full p-3 border rounded-xl"
              value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="md:col-span-2 bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition flex justify-center items-center gap-2">
            {loading ? "Processing..." : <><Save size={20}/> Record Payment</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Fees;
