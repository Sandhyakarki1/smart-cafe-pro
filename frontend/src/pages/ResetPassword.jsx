import { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const emailFromState = location.state?.email || "";

  const [email, setEmail] = useState(emailFromState);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleReset = async () => {
    setMessage("");
    setError("");

    if (!email || !otp || !password) {
      setError("All fields are required");
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/api/admin/reset-password/`, {
        email,
        otp,
        password,
      });
      setMessage(res.data.message);

      // Redirect to login after successful reset
      setTimeout(() => navigate("/admin/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Error resetting password");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-10 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Reset Password</h1>
        {message && <p className="text-green-500 mb-4">{message}</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          readOnly
          className="w-full p-3 mb-4 border rounded"
          required
        />
        <input
          type="text"
          placeholder="OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full p-3 mb-4 border rounded"
          required
        />
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-6 border rounded"
          required
        />
        <button
          onClick={handleReset}
          className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600"
        >
          Reset Password
        </button>
      </div>
    </div>
  );
}

export default ResetPassword;
