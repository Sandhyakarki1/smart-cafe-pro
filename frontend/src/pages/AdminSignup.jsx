import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BASE_URL } from '../config';

const AdminSignup = () => {
  const [step, setStep] = useState(1); 
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: '', 
    otp: '' 
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const requestOTP = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email.toLowerCase().endsWith('@gmail.com')) {
      return setError("Only valid @gmail.com accounts are allowed.");
    }
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match!");
    }
    if (formData.password.length < 6) {
        return setError("Password must be at least 6 characters.");
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/signup/request-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            role: "Admin" 
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setStep(2);
      } else {
        setError(data.error || "Username or Email already exists.");
      }
    } catch (err) {
      setLoading(false);
      setError("Connection Lost. Please ensure Django is running.");
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/signup/verify/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            email: formData.email, 
            otp: formData.otp 
        }),
      });
      
      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        alert("Success! Admin Account Created.");
        navigate("/admin/login");
      } else {
        setError(data.error || "Invalid OTP code. Please try again.");
      }
    } catch (err) {
      setLoading(false);
      setError("Verification Failed. Check your connection.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] font-sans">
      <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-md text-left border border-slate-50">
        <h2 className="text-2xl font-black mb-2 uppercase italic tracking-tighter text-slate-800 text-left">Admin Sign Up</h2>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-8 text-left">
            {step === 1 ? "Create your professional account" : `OTP sent to ${formData.email}`}
        </p>

        {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[11px] font-black uppercase mb-6 border border-red-100 text-center">
                {error}
            </div>
        )}

        {step === 1 ? (
          <form onSubmit={requestOTP} className="space-y-4">
            <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                <input type="text" required placeholder=" " className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500" 
                       onChange={(e)=>setFormData({...formData, username: e.target.value})} />
            </div>
            <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Gmail Address</label>
                <input type="email" required placeholder=" " className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500" 
                       onChange={(e)=>setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                    <input type="password" required placeholder="••••••" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500" 
                           onChange={(e)=>setFormData({...formData, password: e.target.value})} />
                </div>
                <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm</label>
                    <input type="password" required placeholder="••••••" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500" 
                           onChange={(e)=>setFormData({...formData, confirmPassword: e.target.value})} />
                </div>
            </div>
            <button disabled={loading} className="w-full bg-blue-600 text-white py-5 rounded-[24px] font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 active:scale-95 transition-all mt-4 disabled:opacity-50">
              {loading ? "Sending Code..." : "Get Verification Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="text-center">
            <div className="mb-8 text-center">
                <input type="text" placeholder="000000" maxLength="6" className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[30px] text-center text-4xl font-black tracking-[0.3em] outline-none focus:ring-2 focus:ring-emerald-500" 
                       onChange={(e)=>setFormData({...formData, otp: e.target.value})} required/>
                <p className="text-[10px] text-slate-400 font-bold mt-4">Check your Gmail Inbox</p>
            </div>
            <button disabled={loading} className="w-full bg-emerald-500 text-white py-5 rounded-[24px] font-black uppercase tracking-widest shadow-xl hover:bg-emerald-600 transition-all">
                {loading ? "Verifying..." : "Verify & Create Admin"}
            </button>
            <button type="button" onClick={() => setStep(1)} className="mt-6 text-[9px] font-black text-slate-300 uppercase tracking-widest hover:text-slate-500 transition-colors">
                Back to details
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-slate-50 text-center">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                Already an Admin? <Link to="/admin/login" className="text-blue-600 font-black ml-1 hover:underline">Login</Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSignup;
