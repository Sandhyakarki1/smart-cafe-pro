import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false); 
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSendOTP = async () => {
    setMessage("");
    setError("");

    if (!email) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true); 

    try {
      const res = await axios.post(`${BASE_URL}/api/admin/forgot-password/`, { email });
      
      setMessage(res.data.message);
      
      // Delay navigation slightly so user can see the success message
      setTimeout(() => {
        navigate("/admin/reset-password", { state: { email } });
      }, 1500);

    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to connect to server.";
      setError(errorMsg);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800">Forgot Password?</h1>
          <p className="text-gray-500 mt-2">Enter your email to receive a 6-digit OTP code.</p>
        </div>

        {message && (
          <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-sm text-center">
            ✅ {message}
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm text-center">
            ❌ {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
            <input
              type="email"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              required
            />
          </div>

          <button
            onClick={handleSendOTP}
            disabled={loading}
            className={`w-full text-white font-bold p-3 rounded-lg transition-all ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-md"
            }`}
          >
            {loading ? "Sending OTP..." : "Send Reset Code"}
          </button>

          <button
            onClick={() => navigate("/login")}
            className="w-full text-gray-500 text-sm hover:underline mt-2"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;