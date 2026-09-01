import React, { useState, useEffect } from 'react';
import { Printer, Search, CreditCard, Banknote, CheckCircle, Clock, Activity, History as HistoryIcon } from 'lucide-react';


const BASE_URL = "https://prisoners-mood-hearing-moved.trycloudflare.com";

const Billing = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("active"); 

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/orders/`);
      if (res.ok) {
        const data = await res.json();
        // --- 1. LATEST FIRST SORTING ---
        const sortedData = data.sort((a, b) => b.id - a.id);
        setOrders(sortedData);
      }
    } catch (err) {
      console.error("Billing sync error:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); 
    return () => clearInterval(interval);
  }, []);

  const handleSettleCash = async (orderId) => {
    if (!window.confirm("Confirm Cash Received? Order will move to History.")) return;
    try {
      const res = await fetch(`${BASE_URL}/api/orders/${orderId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Paid", payment_method: "cash" })
      });
      if (res.ok) {
        await fetchOrders();
        alert("Cash Settled! Moved to History.");
      }
    } catch (err) { alert("Error."); }
  };

  const printReceipt = (order) => {
    const method = (order.payment_method || 'CASH').toUpperCase();
    const net = (order.total_price / 1.13).toFixed(2);
    const vat = (order.total_price - net).toFixed(2);
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    printWindow.document.write(`
      <html>
        <body style="font-family:monospace; padding:20px; font-size:14px;">
          <h2 style="text-align:center">SMART-CAFE</h2>
          <p style="text-align:center">${new Date(order.created_at).toLocaleString()}</p>
          <hr/>
          <p>Table: ${order.table_number} | ID: #${order.id}</p>
          <p>Method: ${method}</p>
          <hr/>
          <p>${order.items_text}</p>
          <hr/>
          <p>Sub-Total: Rs. ${net}</p>
          <p>VAT (13%): Rs. ${vat}</p>
          <p style="font-weight:bold; font-size:16px;">TOTAL: Rs. ${order.total_price}</p>
          <hr/>
          <p style="text-align:center;">Paid via ${method}<br/>Thank You!</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  // --- FINAL CORRECTED FILTER LOGIC ---

  // 1. ACTIVITY: Only show UNPAID orders where method is CASH
  const activeList = orders.filter(o => 
    o.status.toLowerCase() !== 'paid' && 
    o.payment_method?.toLowerCase() === 'cash' &&
    o.table_number.toString().includes(searchTerm)
  );

  // 2. Show EVERYTHING that is PAID + ALL eSewa orders 
 
  const historyList = orders.filter(o => 
    (o.status.toLowerCase() === 'paid' || o.payment_method?.toLowerCase() === 'esewa') && 
    o.table_number.toString().includes(searchTerm)
  );

  const currentDisplay = view === "active" ? activeList : historyList;

  return (
    <div className="p-8 bg-[#fcfcfd] min-h-screen text-left font-sans animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase italic">
            {view === "active" ? "Active Bills" : "Billing History"}
          </h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1 text-left">
            {view === "active" ? `Pending Cash: ${activeList.length}` : `Digital & Settled: ${historyList.length}`}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1 shadow-inner">
            <button onClick={() => setView("active")} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${view === "active" ? "bg-white shadow-md text-emerald-600" : "text-slate-400"}`}>ACTIVITY</button>
            <button onClick={() => setView("history")} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${view === "history" ? "bg-white shadow-md text-emerald-600" : "text-slate-400"}`}>HISTORY</button>
          </div>
          <div className="bg-white border-2 border-slate-100 p-2 rounded-2xl flex items-center gap-2 px-4 shadow-sm text-slate-300">
            <Search size={16} /><input type="text" placeholder="Table #" className="outline-none text-xs font-bold w-12 text-slate-800" onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {currentDisplay.map((order) => {
          const isOnline = order.payment_method?.toLowerCase() === 'esewa';

          return (
            <div key={order.id} className="bg-white rounded-[45px] p-8 shadow-sm border-2 border-slate-50 relative hover:shadow-2xl transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg">{order.table_number}</div>
                <div className="text-right">
                  <span className={`flex items-center gap-1 justify-end text-[10px] font-black uppercase mb-1 ${isOnline ? 'text-emerald-500' : 'text-orange-500'}`}>
                    {isOnline ? <CreditCard size={12}/> : <Banknote size={12}/>} {order.payment_method?.toUpperCase()}
                  </span>
                  <p className="text-[9px] font-black text-slate-300 uppercase italic">#{order.id} • {order.status}</p>
                </div>
              </div>

              <div className="bg-slate-50/50 rounded-3xl p-5 mb-8 border border-slate-100 min-h-[80px]">
                <p className="text-xs font-bold text-slate-600 italic leading-relaxed">{order.items_text}</p>
              </div>

              <div className="flex justify-between items-center mb-10 px-2 text-left">
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-left">Total Bill</p>
                 <p className="text-3xl font-black text-slate-800 tracking-tighter text-left">Rs. {order.total_price}</p>
              </div>

              <div className="flex gap-2">
                {view === "active" ? (
                  <button onClick={() => handleSettleCash(order.id)} className="flex-1 bg-[#00D161] text-white py-4 rounded-2xl font-black text-xs uppercase shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"><CheckCircle size={16}/> Settle Cash</button>
                ) : (
                  <div className="flex-1 bg-emerald-50 text-emerald-600 py-4 rounded-2xl font-black text-[10px] uppercase flex flex-col items-center justify-center border border-emerald-100 italic">
                    <span>Paid Successfully</span>
                    <span className="opacity-50 text-[7px]">via {order.payment_method}</span>
                  </div>
                )}
                <button onClick={() => printReceipt(order)} className="py-4 px-6 rounded-2xl bg-slate-100 text-slate-400 hover:bg-slate-200 transition-all shadow-sm"><Printer size={20}/></button>
              </div>
            </div>
          );
        })}
      </div>

      {currentDisplay.length === 0 && (
        <div className="text-center py-32 border-4 border-dashed rounded-[60px] border-slate-50 flex flex-col items-center gap-4">
          <Clock size={40} className="text-slate-100" />
          <p className="text-slate-300 font-black uppercase tracking-[0.4em] text-xs">No records available</p>
        </div>
      )}
    </div>
  );
};

export default Billing;