import React, { useState, useEffect } from 'react';
import { 
  Clock, CheckCircle, Plus, Minus, X, ShoppingCart, 
  Utensils, Banknote, ChefHat, Play, Check, CreditCard
} from 'lucide-react';
import { BASE_URL } from '../config';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [cart, setCart] = useState([]); 
 
  const refreshData = async () => {
    try {
      const orderRes = await fetch(`${BASE_URL}/api/orders/`);
      if (orderRes.ok) {
        const orderData = await orderRes.json();
        // Sort by ID to keep order consistent
        setOrders(orderData.sort((a, b) => a.id - b.id));
      }

      const menuRes = await fetch(`${BASE_URL}/api/menu/`);
      if (menuRes.ok) {
        setMenuItems(await menuRes.json());
      }
    } catch (err) { console.error("Sync error:", err); }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 10000); 
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${BASE_URL}/api/orders/${orderId}/status/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) refreshData();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  // --- Modal Cart Logic ---
  const addToCart = (item) => {
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      if (existing.quantity >= item.stock) return alert("Limit reached!");
      setCart(cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      if (item.stock <= 0) return alert("Out of stock!");
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    const existing = cart.find(i => i.id === id);
    if (existing.quantity > 1) {
      setCart(cart.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i));
    } else {
      setCart(cart.filter(i => i.id !== id));
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!tableNumber || cart.length === 0) return alert("Select table and items!");
    const payload = {
      table_number: parseInt(tableNumber),
      items: cart.map(i => ({ id: i.id, qty: i.quantity }))
    };
    const res = await fetch(`${BASE_URL}/api/place-order/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      setIsModalOpen(false);
      setCart([]);
      setTableNumber("");
      refreshData();
    }
  };
  const liveQueue = orders.filter(o => ['Pending', 'Preparing', 'Ready'].includes(o.status));
  
  const servedTables = orders.filter(o => 
    o.status === 'Served' && o.payment_method === 'cash'
  );

  return (
    <div className="p-4 animate-in fade-in duration-500 font-sans">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Order Center</h1>
          <p className="text-slate-400 font-medium mt-1 uppercase text-[10px] tracking-widest">
            {liveQueue.length} Active in Kitchen • {servedTables.length} Pending Cash
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus size={20} /> New Manual Order
        </button>
      </div>

      {/* --- KITCHEN QUEUE --- */}
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-8">
           <div className="p-2 bg-orange-100 text-orange-600 rounded-xl"><ChefHat size={20}/></div>
           <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Kitchen Queue</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {liveQueue.map(order => (
            <OrderCard key={order.id} order={order} onUpdate={handleUpdateStatus} isLive={true} />
          ))}
          {liveQueue.length === 0 && (
            <div className="col-span-full py-16 text-center border-2 border-dashed rounded-[40px] text-slate-300 font-bold italic">
                No items in the kitchen queue.
            </div>
          )}
        </div>
      </div>

      {/* --- SERVED TABLES (CASH ONLY) --- */}
      <div className="pb-20">
        <div className="flex items-center gap-3 mb-8">
           <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl"><Banknote size={20}/></div>
           {/* Renamed for clarity */}
           <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Served • Pending Cash</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servedTables.map(order => (
            <OrderCard key={order.id} order={order} onUpdate={handleUpdateStatus} isLive={false} />
          ))}
          {servedTables.length === 0 && (
            <div className="col-span-full py-16 text-center border-2 border-dashed rounded-[40px] text-slate-300 font-bold italic">
                No cash payments pending.
            </div>
          )}
        </div>
      </div>

      {/* --- MANUAL ORDER MODAL  --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
           <div className="bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] flex shadow-2xl relative overflow-hidden">
             {/* ... Modal content same as before ... */}
             <button onClick={() => setIsModalOpen(false)} className="absolute right-8 top-8 text-slate-400 hover:text-slate-800 z-20"><X size={28}/></button>
             <div className="flex-[1.5] p-10 overflow-y-auto border-r border-slate-100 bg-white">
                <h2 className="text-2xl font-black mb-8 italic text-left">Add Items</h2>
                <div className="grid grid-cols-2 gap-5">
                  {menuItems.map(item => (
                    <button key={item.id} onClick={() => addToCart(item)} className="p-5 rounded-3xl border-2 text-left hover:border-indigo-500 bg-white shadow-sm transition-all">
                       <div className="font-black text-slate-800 uppercase text-xs">{item.name}</div>
                       <p className="text-indigo-600 font-black mt-1">Rs {item.price}</p>
                    </button>
                  ))}
                </div>
             </div>
             <div className="flex-1 p-10 bg-slate-50 flex flex-col">
                <h3 className="text-xl font-black mb-8 flex items-center gap-2"><ShoppingCart size={22}/> CART</h3>
                <select className="w-full border-2 p-4 rounded-2xl mb-8 font-bold" value={tableNumber} onChange={e => setTableNumber(e.target.value)}>
                   <option value="">Table...</option>
                   {[1,2,3,4,5].map(n => <option key={n} value={n}>Table {n}</option>)}
                </select>
                <div className="flex-1 overflow-y-auto space-y-4 mb-8">
                  {cart.map(item => (
                    <div key={item.id} className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm">
                       <span className="text-xs font-black uppercase">{item.name}</span>
                       <div className="flex items-center gap-3">
                          <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 bg-slate-100 rounded-md">-</button>
                          <span className="text-xs font-black">{item.quantity}</span>
                          <button onClick={() => addToCart(item)} className="w-6 h-6 bg-slate-100 rounded-md">+</button>
                       </div>
                    </div>
                  ))}
                </div>
                <button onClick={handlePlaceOrder} className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black uppercase tracking-widest shadow-2xl">Place Order</button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

const OrderCard = ({ order, onUpdate, isLive }) => {
  const getStatusStyle = (s) => {
    if (s === 'Pending') return 'bg-orange-100 text-orange-600';
    if (s === 'Preparing') return 'bg-blue-100 text-blue-600';
    if (s === 'Ready') return 'bg-emerald-100 text-emerald-600';
    return 'bg-slate-100 text-slate-600';
  };

  return (
    <div className={`bg-white p-8 rounded-[45px] shadow-sm border-2 transition-all ${isLive ? 'border-slate-50' : 'border-emerald-50 shadow-xl shadow-emerald-50/30'}`}>
       <div className="flex justify-between items-start mb-6">
          <div className={`w-14 h-14 text-white rounded-2xl flex items-center justify-center font-black text-2xl ${isLive ? 'bg-slate-900' : 'bg-emerald-500'}`}>
            {order.table_number}
          </div>
          <div className="text-right text-left">
             <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusStyle(order.status)}`}>
               {order.status}
             </span>
             <p className="text-[10px] text-slate-300 mt-2 font-bold uppercase tracking-widest text-right">Order #{order.id}</p>
          </div>
       </div>

       <div className="bg-slate-50 rounded-[28px] p-5 mb-8 border border-slate-100 min-h-[90px] text-left">
          <p className="text-xs font-bold text-slate-600 leading-relaxed italic">{order.items_text}</p>
       </div>

       <div className="flex justify-between items-center">
          <div className="text-left">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 text-left">Amount</p>
            <div className="text-2xl font-black text-slate-800">Rs {order.total_price}</div>
          </div>
          
          <div className="flex gap-2">
            {order.status === 'Pending' && (
              <button onClick={() => onUpdate(order.id, 'Preparing')} className="p-4 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 transition-all"><Play size={20} fill="white"/></button>
            )}
            {order.status === 'Preparing' && (
              <button onClick={() => onUpdate(order.id, 'Ready')} className="p-4 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-all"><Check size={20}/></button>
            )}
            {order.status === 'Ready' && (
              <button onClick={() => onUpdate(order.id, 'Served')} className="p-4 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all text-xs font-black uppercase">Serve</button>
            )}
            {order.status === 'Served' && (
              <button onClick={() => onUpdate(order.id, 'Paid')} className="px-5 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-black">
                <Banknote size={16}/> Settle
              </button>
            )}
          </div>
       </div>
    </div>
  );
};

export default Orders;