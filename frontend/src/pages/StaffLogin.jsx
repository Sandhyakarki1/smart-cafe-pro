import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Utensils, ChefHat, LogIn, ShieldAlert } from 'lucide-react';
import { BASE_URL } from '../config';

export default function StaffLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Waiter"); 
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleStaffLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      
     const res = await fetch(`${BASE_URL}/api/staff/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }) 
      });

      const data = await res.json();

      if (res.ok) {
       
        localStorage.setItem("userRole", data.role);
        localStorage.setItem("userName", data.username);

        alert(`${data.role} Login Successful!`);

        // Redirect based on the role returned from Django
        if (data.role === "Kitchen Staff") {
          navigate("/kitchen/dashboard");
        } else {
          navigate("/waiter/dashboard");
        }
      } else {
        alert(data.error || "Staff login failed. Check credentials.");
      }
    } catch (err) {
      alert("Backend connection error. Ensure Django is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 font-sans">
      <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-md border-b-8 border-indigo-600 animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center mb-6">
            <div className="bg-indigo-50 p-5 rounded-3xl text-indigo-600 shadow-inner">
                <ChefHat size={44} />
            </div>
        </div>
        
        <h2 className="text-3xl font-black text-center text-slate-800 mb-1">Staff Portal</h2>
        <p className="text-center text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-10">
          Kitchen & Waiter Team
        </p>
        
        <form onSubmit={handleStaffLogin} className="space-y-6">
          {/* Department Selection */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Department</label>
            <select 
              className="w-full p-4 mt-1 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all appearance-none"
              value={role} 
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="Waiter">☕ Waiter </option>
              <option value="Kitchen Staff">🍳 Kitchen</option>
            </select>
          </div>

          {/* Email Input */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Gmail Address</label>
            <input 
              type="email" 
              placeholder="name@gmail.com" 
              className="w-full p-4 mt-1 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 transition-all" 
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Security Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full p-4 mt-1 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 transition-all" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? "VERIFYING..." : <><LogIn size={20}/> LOG IN</>}
          </button>
        </form>

        {/* ADMIN REDIRECT LINK */}
        <div className="mt-10 text-center border-t border-slate-50 pt-6">
            <Link 
              to="/admin/login" 
              className="group flex items-center justify-center gap-2 text-slate-400 text-[10px] font-black uppercase hover:text-indigo-600 transition-colors tracking-widest"
            >
               <ShieldAlert size={14} className="group-hover:animate-bounce"/> 
               Are you an Admin? Click here
            </Link>
        </div>
      </div>
    </div>
  );
}