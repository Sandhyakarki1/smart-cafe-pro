import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom"; 
import { BASE_URL } from "../config";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("EMAIL:", JSON.stringify(email));
    console.log("PASSWORD:", JSON.stringify(password));
    setError("");

    // --- GMAIL VALIDATION ---
    if (!email.toLowerCase().endsWith("@gmail.com")) {
      setError("Only @gmail.com accounts are allowed.");
      return;
    }

    try {
     const res = await axios.post(`${BASE_URL}/api/admin/login/`, {
        email,
        password,
      });

      const userData = {
        ...res.data,
        email: email
      };
      localStorage.setItem("admin_user", JSON.stringify(userData));

      // Redirect to dashboard
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid email or password");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-96">
        <h1 className="text-2xl font-black mb-6 text-center text-slate-800 uppercase tracking-tighter italic">Admin Login</h1>
        
        {error && (
          <p className="text-red-500 bg-red-50 p-3 rounded-lg text-xs font-bold mb-4 text-center border border-red-100 uppercase">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gmail Address</label>
            <input
              type="email"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 mt-1 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              required
            />
          </div>

          <div className="mb-6">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
            <input
              type="password"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mt-1 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              required
            />
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white p-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100">
            Login
          </button>
        </form>

        <div className="mt-8 space-y-3 text-center">
          <p className="text-sm">
            <Link to="/admin/forgot-password" size={14} className="text-blue-500 hover:underline font-bold">Forgot Password?</Link>
          </p>
          
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest pt-4 border-t">
            Don't have an account? 
            <Link to="/admin/signup" className="text-blue-600 ml-2 hover:underline">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;