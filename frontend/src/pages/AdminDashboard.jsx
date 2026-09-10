import React, { useState, useEffect } from 'react';
import { Users, Utensils, ClipboardList, Clock, AlertTriangle, ArrowRight, CreditCard, Banknote } from 'lucide-react';
import { BASE_URL } from '../config';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ total_staff: 0, total_menu: 0, total_orders: 0, pending_orders: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]); 

  const fetchDashboardData = async () => {
    try {
     const statsRes = await fetch(`${BASE_URL}/api/stats/`);
      const statsData = await statsRes.json();
      
     const ordersRes = await fetch(`${BASE_URL}/api/orders/`);
      const ordersData = await ordersRes.json();

      const menuRes = await fetch(`${BASE_URL}/api/menu/`);
      const menuData = await menuRes.json();

      setStats({
        total_staff: statsData.total_staff,
        total_menu: statsData.total_menu,
        total_orders: statsData.total_orders,
        pending_orders: statsData.pending_orders
      });
      
      setRecentOrders(ordersData.slice(0, 8)); 
      setLowStockItems(menuData.filter(item => item.stock < 5));
      
    } catch (err) {
      console.error("Dashboard sync error:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="animate-in fade-in duration-700 p-2 relative">
      
      {/* --- STAT CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 text-left">
        <StatCard icon={<Users className="text-blue-600"/>} label="Total Staff" value={stats.total_staff} />
        <StatCard icon={<Utensils className="text-emerald-500"/>} label="Menu Items" value={stats.total_menu} />
        <StatCard icon={<ClipboardList className="text-indigo-600"/>} label="Total Orders" value={stats.total_orders} />
        <StatCard icon={<Clock className="text-orange-500"/>} label="Pending Prep" value={stats.pending_orders} />
      </div>

      {/* --- ACTIVITY & ALERTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* RECENT ACTIVITY TABLE */}
        <div className="lg:col-span-2 bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest italic">Live Order Stream</h2>
            <span className="text-[10px] font-bold text-slate-400">Auto-refreshing...</span>
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Table</th>
                  <th className="px-6 py-4">Payment</th> 
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="group hover:bg-indigo-50/20 transition-all">
                    <td className="px-6 py-5 font-black text-slate-700 text-sm">#00{order.id}</td>
                    <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                           <div className="w-7 h-7 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black text-[10px]">
                             {order.table_number}
                           </div>
                           <span className="font-bold text-slate-400 text-xs uppercase tracking-tighter">Table</span>
                        </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        {order.payment_method === 'khalti' ? (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-600 border border-purple-100 rounded-xl text-[9px] font-black uppercase tracking-wider shadow-sm">
                            <CreditCard size={12} /> Khalti
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-xl text-[9px] font-black uppercase tracking-wider shadow-sm">
                            <Banknote size={12} /> Cash
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter shadow-sm ${
                        order.status === 'Pending' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recentOrders.length === 0 && <p className="text-center py-20 text-slate-300 font-bold italic">No active orders.</p>}
          </div>
        </div>

        {/* INVENTORY ALERT WIDGET */}
        <div className="bg-[#1e293b] rounded-[45px] p-8 text-white shadow-2xl relative overflow-hidden flex flex-col">
           <div className="relative z-10 flex-1 text-left">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-red-500/20 text-red-400 rounded-2xl">
                   <AlertTriangle size={20} />
                </div>
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-100">Stock Alerts</h2>
              </div>
              <div className="space-y-4">
                {lowStockItems.length > 0 ? lowStockItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div>
                      <p className="text-xs font-bold text-white tracking-tight">{item.name}</p>
                      <p className="text-[9px] text-slate-500 uppercase font-black">{item.category}</p>
                    </div>
                    <span className={`font-black text-[10px] px-2 py-1 rounded-lg ${item.stock === 0 ? 'text-red-400 bg-red-400/10' : 'text-orange-400 bg-orange-400/10'}`}>
                      {item.stock === 0 ? "OUT" : `${item.stock} Left`}
                    </span>
                  </div>
                )) : <p className="text-slate-500 text-xs italic text-center py-10">All items are in stock.</p>}
              </div>
           </div>
           <button 
             onClick={() => window.location.href='/admin/menu'}
             className="relative z-10 w-full mt-10 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all shadow-inner"
           >
             Manage Inventory <ArrowRight size={14}/>
           </button>
           <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: STAT CARD ---
const StatCard = ({ icon, label, value }) => (
  <div className="bg-white p-8 rounded-[40px] border border-slate-50 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group">
    <div className="flex justify-between items-start mb-5">
      <div className="p-4 bg-slate-50 rounded-2xl group-hover:scale-110 transition-transform shadow-inner">{icon}</div>
      <div className="flex flex-col items-end">
         <span className="text-[9px] font-black text-emerald-500 flex items-center gap-1.5 tracking-tighter bg-emerald-50 px-2 py-1 rounded-md">
            LIVE <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
         </span>
      </div>
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
    <div className="text-3xl font-black text-slate-800 tracking-tighter">{value}</div>
  </div>
);

export default AdminDashboard;