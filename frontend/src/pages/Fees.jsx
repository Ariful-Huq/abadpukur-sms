import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { CreditCard, Save, History, CheckCircle, Clock, AlertCircle, Search, FileText, Download } from 'lucide-react';

const Fees = () => {
  const [students, setStudents] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
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

  useEffect(() => {
    loadData();
  }, []);

  const handleDownloadReceipt = (paymentId) => {
    // This points to your Django view: api/receipt/<id>/
    const url = `${api.defaults.baseURL}receipt/${paymentId}/`;
    window.open(url, '_blank');
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
    const matchesSearch = pay.student_name.toLowerCase().includes(searchTerm.toLowerCase());
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
             Current View Total: <span className="font-bold">৳{filteredPayments.reduce((acc, curr) => acc + parseFloat(curr.amount_paid), 0).toFixed(2)}</span>
           </p>
        </div>
      </div>

      {/* Payment Form Section */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-gray-700">
          <Save size={18} className="text-gray-400" /> Record New Payment
        </h2>
        <form onSubmit={handlePaymentSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Select Student</label>
            <select required className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-500 transition"
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

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Method</label>
            <select className="w-full p-3 border rounded-xl bg-gray-50"
              value={formData.payment_method} onChange={e => setFormData({...formData, payment_method: e.target.value})}>
              <option value="CASH">Cash</option>
              <option value="MFS">bKash/Nagad (MFS)</option>
              <option value="Bank">Bank Transfer</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Transaction ID</label>
            <input type="text" className="w-full p-3 border rounded-xl bg-gray-50"
              value={formData.transaction_id} onChange={e => setFormData({...formData, transaction_id: e.target.value})} />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
            <select className="w-full p-3 border rounded-xl bg-gray-50"
              value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="lg:col-span-3 bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition flex justify-center items-center gap-2">
            {loading ? "Processing..." : <><Save size={20}/> Record Payment</>}
          </button>
        </form>
      </div>

      {/* Transaction History Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <History className="text-gray-400" size={20} />
            <h2 className="text-lg font-bold text-gray-700">Transaction History</h2>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="Search student..." className="pl-10 pr-4 py-2 border rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500 w-64"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            
            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border">
              <button onClick={() => setStatusFilter('ALL')} className={`px-3 py-1 text-xs font-bold rounded-md transition ${statusFilter === 'ALL' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}>All</button>
              <button onClick={() => setStatusFilter('PENDING')} className={`px-3 py-1 text-xs font-bold rounded-md transition ${statusFilter === 'PENDING' ? 'bg-white shadow-sm text-yellow-600' : 'text-gray-500'}`}>Pending</button>
              <button onClick={() => setStatusFilter('COMPLETED')} className={`px-3 py-1 text-xs font-bold rounded-md transition ${statusFilter === 'COMPLETED' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500'}`}>Done</button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Student & ID</th>
                <th className="px-6 py-4">Fee Type</th>
                <th className="px-6 py-4 text-center">Amount</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredPayments.map((pay) => (
                <tr key={pay.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{pay.student_name}</p>
                    <p className="text-[10px] text-gray-400 font-mono uppercase">{pay.transaction_id || 'Cash Entry'}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{pay.fee_name}</td>
                  <td className="px-6 py-4 font-bold text-gray-900 text-center">৳{pay.amount_paid}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      pay.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {pay.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDownloadReceipt(pay.id)}
                      className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-bold text-xs bg-indigo-50 px-3 py-1.5 rounded-lg transition-all"
                    >
                      <FileText size={14} /> Receipt
                    </button>
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
