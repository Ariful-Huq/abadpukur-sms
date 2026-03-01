import React, { useState } from 'react';
import { CreditCard, Smartphone, CheckCircle2, AlertCircle } from 'lucide-react';

const FeeManagement = () => {
  const [selectedFee, setSelectedFee] = useState(null);
  const [mfsNumber, setMfsNumber] = useState('');

  const fees = [
    { id: 1, name: 'Monthly Tuition - Oct', amount: 5000, status: 'Unpaid' },
    { id: 2, name: 'Exam Fee', amount: 1500, status: 'Unpaid' },
    { id: 3, name: 'Library Fee', amount: 200, status: 'Paid' },
  ];

  const handleMFSPayment = async () => {
    // Logic to call your Django backend which then calls the MFS API (bKash/Nagad)
    alert(`Initiating MFS payment for ${selectedFee.name} via ${mfsNumber}`);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Fee Management</h2>

      <div className="grid gap-4">
        {fees.map((fee) => (
          <div key={fee.id} className="bg-white p-6 rounded-xl border flex justify-between items-center">
            <div>
              <p className="font-bold text-lg text-gray-800">{fee.name}</p>
              <p className="text-indigo-600 font-semibold">{fee.amount} BDT</p>
            </div>
            {fee.status === 'Paid' ? (
              <span className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-bold">
                <CheckCircle2 size={16} /> Paid
              </span>
            ) : (
              <button 
                onClick={() => setSelectedFee(fee)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Pay Now
              </button>
            )}
          </div>
        ))}
      </div>

      {/* MFS Payment Modal (Simplified) */}
      {selectedFee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4">MFS Payment</h3>
            <p className="text-gray-500 mb-6 text-sm">Paying: {selectedFee.name} ({selectedFee.amount} BDT)</p>
            
            <label className="block text-sm font-medium mb-1">MFS Number (bKash/Nagad)</label>
            <input 
              type="text" 
              placeholder="017XXXXXXXX"
              className="w-full p-3 border rounded-lg mb-4 outline-none focus:ring-2 focus:ring-indigo-500"
              onChange={(e) => setMfsNumber(e.target.value)}
            />

            <div className="flex gap-3">
              <button onClick={() => setSelectedFee(null)} className="flex-1 py-3 text-gray-500 font-bold">Cancel</button>
              <button 
                onClick={handleMFSPayment}
                className="flex-1 bg-pink-600 text-white py-3 rounded-lg font-bold hover:bg-pink-700"
              >
                Confirm Pay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeManagement;
