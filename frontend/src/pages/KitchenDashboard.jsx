import React, { useState, useEffect } from 'react';
import { ChefHat, Play, CheckCircle, MessageSquare, Loader2 } from 'lucide-react';
import { BASE_URL } from '../config';

export default function KitchenDashboard() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/orders/`);
      const data = await res.json();
      
      // --- Filter for Kitchen AND Sort by Latest ID ---
      const kitchenOrders = data
        .filter(o => o.status === 'Pending' || o.status === 'Preparing' || o.status === 'Paid')
        .sort((a, b) => b.id - a.id); 
        
      setOrders(kitchenOrders);
    } catch (err) {
      console.error("Kitchen fetch error:", err);
    }
  };

  const updateStatus = async (id, newStatus) => {
    await fetch(`${BASE_URL}/api/orders/${id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });
    fetchOrders(); 
  };

  useEffect(() => { 
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 bg-[#FFF9F5] min-h-screen text-left font-sans">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3 italic">
          <ChefHat size={32} className="text-orange-500"/> KITCHEN BOARD
        </h1>
        <span className="text-[10px] font-black bg-orange-100 text-orange-600 px-4 py-2 rounded-full uppercase tracking-widest animate-pulse">Live Feed</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {orders.map(order => (
          <div key={order.id} className="bg-white p-7 rounded-[40px] shadow-sm border-2 border-orange-50 flex flex-col h-full hover:shadow-xl transition-all">
            <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-1">Table</span>
                  <span className="font-black text-4xl text-slate-800 tracking-tighter">{order.table_number}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-slate-300 uppercase block mb-1">Order ID</span>
                  <span className="font-bold text-slate-400 text-sm">#00{order.id}</span>
                </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-3xl mb-6 flex-1 border border-slate-100">
               <p className="text-sm font-bold text-slate-700 leading-relaxed italic">{order.items_text}</p>
            </div>

            <div className="flex gap-3">
              {(order.status === 'Pending' || order.status === 'Paid') ? (
                <button 
                  onClick={() => updateStatus(order.id, 'Preparing')} 
                  className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-orange-600 active:scale-95 transition-all shadow-lg shadow-orange-100"
                >
                  <Play size={16} fill="white"/> Start Cooking
                </button>
              ) : (
                <button 
                  onClick={() => updateStatus(order.id, 'Ready')} 
                  className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-600 active:scale-95 transition-all shadow-lg shadow-emerald-100"
                >
                  <CheckCircle size={18}/> Mark Ready
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-32 border-4 border-dashed rounded-[60px] border-orange-100">
           <p className="text-slate-300 font-black uppercase tracking-[0.4em] text-xs">All orders completed</p>
        </div>
      )}
    </div>
  );
}