import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { CreditCard, Save, History, CheckCircle, Clock, Search, FileText, Smartphone } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const Fees = () => {
  const [students, setStudents] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const location = useLocation();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    student: '',
    fee_type: '',
    amount_paid: '',
    payment_method: 'CASH',
    status: 'COMPLETED',
    transaction_id: '',
    remarks: ''
  });

  const loadData = async () => {
    try {
      const [sRes, fRes, pRes] = await Promise.all([
        api.get('students/'),
        api.get('fee-structures/'),
        api.get('fee-payments/')
      ]);
      setStudents(sRes.data);
      setFeeStructures(fRes.data);
      const sortedPayments = pRes.data.sort((a, b) => b.id - a.id);
      setRecentPayments(sortedPayments);
    } catch (err) { 
      console.error("Failed to load data", err); 
    }
  };

  // Check for MFS Redirect Success
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('status') === 'success') {
      const tid = params.get('trans_id');
      alert(`Success! Transaction ${tid} verified via Demo MFS.`);
      // Clean the URL
      navigate('/fees', { replace: true });
    }
    loadData();
  }, [location]);

  const handleDownloadReceipt = (paymentId) => {
    const url = `${api.defaults.baseURL}receipt/${paymentId}/`;
    window.open(url, '_blank');
  };

  const handlePaybKash = async (pay) => {
    try {
      setLoading(true);
      const res = await api.post('payment/init/', {
        student_id: pay.student,
        fee_type_id: pay.fee_type,
        amount: pay.amount_paid
      });
      
      if (res.data.gateway_url) {
        // In demo mode, this just redirects back to this page with success params
        window.location.href = res.data.gateway_url;
      }
    } catch (err) {
      alert("MFS Initialization failed.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('fee-payments/', formData);
      alert("Payment Logged Successfully!");
      setFormData({ ...formData, student: '', fee_type: '', amount_paid: '', transaction_id: '', remarks: '' });
      loadData();
    } catch (err) {
      alert("Error logging payment. Verify transaction ID is unique.");
    } finally { setLoading(false); }
  };

  const filteredPayments = recentPayments.filter(pay => {
    const name = pay.student_name ? pay.student_name.toLowerCase() : "";
    const matchesSearch = name.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || pay.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
          <CreditCard className="text-indigo-600" /> Student Fee Collection
        </h1>
        <div className="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100 hidden md:block">
           <p className="text-indigo-700 text-sm font-medium">
             Total: <span className="font-bold">৳{filteredPayments.reduce((acc, curr) => acc + parseFloat(curr.amount_paid), 0).toFixed(2)}</span>
           </p>
        </div>
      </div>

      {/* Payment Form */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-gray-700">
          <Save size={18} className="text-gray-400" /> Record New Payment
        </h2>
        <form onSubmit={handlePaymentSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Select Student</label>
            <select required className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-500"
              value={formData.student} onChange={e => setFormData({...formData, student: e.target.value})}>
              <option value="">Select Student...</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.registration_number})</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Fee Category</label>
            <select required className="w-full p-3 border rounded-xl bg-gray-50"
              value={formData.fee_type} 
              onChange={e => {
                const selected = feeStructures.find(f => f.id === parseInt(e.target.value));
                setFormData({...formData, fee_type: e.target.value, amount_paid: selected ? selected.amount : ''});
              }}>
              <option value="">Select Fee Type...</option>
              {feeStructures.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Amount (৳)</label>
            <input type="number" step="0.01" required className="w-full p-3 border rounded-xl bg-gray-50"
              value={formData.amount_paid} onChange={e => setFormData({...formData, amount_paid: e.target.value})} />
          </div>

          <button type="submit" disabled={loading} className="lg:col-span-3 bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition flex justify-center items-center gap-2">
            {loading ? "Processing..." : <><Save size={20}/> Record Cash Payment</>}
          </button>
        </form>
      </div>

      {/* History */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2"><History size={20}/> Transaction History</h2>
          <div className="flex gap-3">
             <input type="text" placeholder="Search..." className="px-4 py-2 border rounded-lg text-sm bg-gray-50"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
             <select className="border rounded-lg text-sm px-2" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="ALL">All Status</option>
                <option value="COMPLETED">Completed</option>
                <option value="PENDING">Pending</option>
             </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Fee Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredPayments.map((pay) => (
                <tr key={pay.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{pay.student_name}</td>
                  <td className="px-6 py-4 text-gray-500">{pay.fee_name}</td>
                  <td className="px-6 py-4 font-bold">৳{pay.amount_paid}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                      pay.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {pay.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    {pay.status === 'PENDING' && (
                      <button onClick={() => handlePaybKash(pay)} className="flex items-center gap-1 bg-pink-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-pink-700">
                        <Smartphone size={14} /> Pay bKash
                      </button>
                    )}
                    {pay.status === 'COMPLETED' && (
                      <button onClick={() => handleDownloadReceipt(pay.id)} className="flex items-center gap-1 text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-100">
                        <FileText size={14} /> Receipt
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Fees;
