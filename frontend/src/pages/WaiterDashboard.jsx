import React, { useState, useEffect } from 'react';
import { Utensils, Navigation, BellRing, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';
import { BASE_URL } from '../config';

export default function WaiterDashboard() {
  const [readyOrders, setReadyOrders] = useState([]);
  const [pendingConfirmation, setPendingConfirmation] = useState([]);
  const [overdueOrders, setOverdueOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/orders/`);
      const data = await res.json();

      // Orders ready to be picked up and served
      const ready = data.filter(o => o.status === 'Ready').sort((a, b) => b.id - a.id);
      setReadyOrders(ready);

      // QR orders waiting for a waiter to confirm someone is actually at the table
      const awaiting = data.filter(o => o.status === 'Awaiting Confirmation').sort((a, b) => b.id - a.id);
      setPendingConfirmation(awaiting);

      // Tables served a while ago but still unpaid — possible dine-and-dash risk
      const now = new Date();
      const overdue = data.filter(o => {
        if (o.status !== 'Served') return false;
        // Fallback to updated_at if served_at isn't present on older orders
        const servedTime = o.served_at ? new Date(o.served_at) : null;
        if (!servedTime) return false;
        const minutesSinceServed = (now - servedTime) / 60000;
        return minutesSinceServed > 25;
      });
      setOverdueOrders(overdue);

    } catch (err) { console.error(err); }
  };

  const markServed = async (id) => {
    await fetch(`${BASE_URL}/api/orders/${id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: 'Served' })
    });
    fetchOrders();
  };

  const confirmOrder = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/api/orders/${id}/confirm/`, {
        method: "PATCH",
      });
      if (res.ok) {
        fetchOrders();
      } else {
        alert("Could not confirm this order.");
      }
    } catch (err) {
      alert("Connection error while confirming order.");
    }
  };

  useEffect(() => { 
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 bg-[#F1F6FF] min-h-screen text-left">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-black flex items-center gap-3 uppercase tracking-tighter italic">
          <Utensils size={32}/> Pickup Station
        </h1>
        <span className="text-[10px] font-black bg-emerald-500 text-white px-4 py-2 rounded-full shadow-lg shadow-emerald-200">
           {readyOrders.length} ORDERS READY
        </span>
      </div>

      {/* OVERDUE PAYMENT ALERTS */}
      {overdueOrders.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="text-red-500" size={22} />
            <h2 className="text-lg font-black uppercase tracking-tight text-red-600">Unpaid Tables — Check Now</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {overdueOrders.map(order => (
              <div key={order.id} className="bg-red-50 border-2 border-red-200 p-5 rounded-3xl flex justify-between items-center animate-pulse">
                <div>
                  <p className="font-black text-red-700 text-lg">Table {order.table_display || order.table_number}</p>
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Served but still unpaid</p>
                </div>
                <span className="text-red-500 font-black text-xs uppercase">Order #{order.id}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NEW ORDERS — WAITING ON WAITER CONFIRMATION */}
      {pendingConfirmation.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="text-indigo-600" size={22} />
            <h2 className="text-lg font-black uppercase tracking-tight text-indigo-700">New Orders — Confirm Table</h2>
          </div>
          <p className="text-xs text-slate-400 font-medium mb-6">
            Check that a customer is actually sitting at this table before confirming — this prevents prank or remote orders.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingConfirmation.map(order => (
              <div key={order.id} className="bg-white p-6 rounded-3xl shadow-sm border-2 border-indigo-100 flex justify-between items-center">
                <div>
                  <p className="text-2xl font-black text-slate-800">Table {order.table_display || order.table_number}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Order #{order.id}</p>
                </div>
                <button
                  onClick={() => confirmOrder(order.id)}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 active:scale-95 transition-all shadow-lg"
                >
                  Confirm
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* READY TO SERVE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {readyOrders.map(order => (
          <div key={order.id} className="bg-white p-8 rounded-[45px] shadow-xl border-l-[12px] border-emerald-500 flex flex-col justify-between hover:-translate-y-1 transition-all duration-500">
            <div>
                <div className="flex justify-between items-start mb-6">
                   <div>
                      <span className="text-5xl font-black text-slate-800 tracking-tighter uppercase">Table {order.table_display || order.table_number}</span>
                      <p className="text-xs font-black text-slate-300 mt-2 uppercase tracking-[0.2em]">Ticket #00{order.id}</p>
                   </div>
                   <BellRing className="text-emerald-500 animate-bounce" size={32} />
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl mb-10 border border-slate-100">
                   <p className="text-xl text-slate-600 font-bold italic leading-relaxed">{order.items_text}</p>
                </div>
            </div>
            <button 
              onClick={() => markServed(order.id)} 
              className="w-full bg-slate-900 text-white py-6 rounded-[30px] font-black tracking-[0.2em] uppercase text-sm flex items-center justify-center gap-3 hover:bg-black shadow-2xl transition-all active:scale-95"
            >
              <Navigation size={22} fill="white"/> Confirm Delivered
            </button>
          </div>
        ))}
      </div>

      {readyOrders.length === 0 && pendingConfirmation.length === 0 && overdueOrders.length === 0 && (
        <div className="text-center mt-32">
           <Clock size={64} className="mx-auto text-slate-200 mb-6" strokeWidth={1}/>
           <p className="text-slate-300 font-black uppercase tracking-[0.4em] text-xs">Nothing to serve right now</p>
        </div>
      )}
    </div>
  );
}
