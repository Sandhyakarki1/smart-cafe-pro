import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, ChefHat, Bell, Star, CheckCircle, MessageSquare } from "lucide-react";
import { BASE_URL } from "../config";

export default function CustomerOrderTracking() {
  const { id } = useParams();


  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/orders/${id}/`);
      if (response.ok) setOrder(await response.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(() => {
      if (order?.status !== 'Served' && !submitted) fetchOrder();
    }, 5000);
    return () => clearInterval(interval);
  }, [id, order?.status, submitted]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${BASE_URL}/api/feedback/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: id, rating, comment })
    });
    if (res.ok) setSubmitted(true);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Syncing with Kitchen...</div>;
  if (!order) return <div className="p-20 text-center text-red-500 font-black">Order not found.</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      
      {/*  LIVE TRACKING (Shows until food is Served) */}
      {order.status !== 'Served' && !submitted ? (
        <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-md text-center animate-in zoom-in duration-500">
          <h1 className="text-2xl font-black text-slate-800 mb-8 uppercase tracking-tight">Order Status</h1>
          <div className="flex justify-center mb-10">
            <div className="w-28 h-28 bg-indigo-600 rounded-[35px] flex items-center justify-center text-white shadow-2xl relative">
              {order.status === 'Pending' && <Clock size={48} className="animate-pulse" />}
              {order.status === 'Preparing' && <ChefHat size={48} className="animate-bounce" />}
              {order.status === 'Ready' && <Bell size={48} className="animate-bounce text-yellow-300" />}
            </div>
          </div>
          <h2 className="text-4xl font-black uppercase text-slate-800 mb-2">{order.status}</h2>
          <p className="text-slate-400 font-medium mb-10">Order #00{order.id} • Table {order.table_number}</p>
          <div className="bg-slate-50 p-6 rounded-3xl text-left border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Items</p>
            <p className="font-bold text-slate-700 italic text-sm">{order.items_text}</p>
          </div>
        </div>

      /* FEEDBACK (Automatically appears when status is Served) */
      ) : !submitted ? (
        <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-md animate-in slide-in-from-bottom duration-700 text-left">
          <CheckCircle className="text-emerald-500 mb-4" size={32} />
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Food Served! 🍽️</h2>
          <p className="text-slate-500 text-sm mt-1 mb-8 font-medium">How was your experience at Table {order.table_number}?</p>
          <form onSubmit={handleFeedbackSubmit} className="space-y-8">
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map(n => (
                <button type="button" key={n} onClick={() => setRating(n)}>
                  <Star size={32} fill={n <= rating ? "#fbbf24" : "none"} stroke={n <= rating ? "#fbbf24" : "#cbd5e1"} className="transition-all active:scale-150"/>
                </button>
              ))}
            </div>
            <textarea className="w-full bg-slate-50 border-0 rounded-[24px] p-6 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 h-28 resize-none" placeholder="Share your thoughts..." value={comment} onChange={(e) => setComment(e.target.value)} />
            <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Submit Review</button>
          </form>
          {order.payment_method?.toLowerCase() === 'cash' && (
             <p className="text-center mt-6 text-[10px] text-amber-600 font-bold uppercase tracking-widest bg-amber-50 py-3 rounded-xl">Please pay Rs. {order.total_price} at the counter</p>
          )}
        </div>

      /*  THANK YOU */
      ) : (
        <div className="text-center animate-in zoom-in duration-500">
           <MessageSquare size={64} className="text-indigo-600 mx-auto mb-6"/>
           <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Thank You!</h1>
           <button onClick={() => navigate(`/menu/${order.table_number}`)} className="mt-12 text-indigo-600 font-black border-b-2 border-indigo-100 pb-1 uppercase text-xs tracking-widest">Order More Food</button>
        </div>
      )}
    </div>
  );
}