import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addUser } from "../utils/userSlice";
import { BASE_URL } from "../utils/constants";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    emailId: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/signup";
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Authentication failed");
      }

      const data = await response.json();
      
      // For both login and signup, use the user data from the response
      dispatch(addUser(data.user || data));
      
      // Clear form and navigate to feed
      setFormData({
        emailId: "",
        password: "",
        firstName: "",
        lastName: "",
      });
      
      navigate("/feed");
    } catch (err) {
      console.error("Auth error:", err);
      setError(err.message || "Failed to authenticate");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Clear error when user types
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotStatus("");
    setForgotLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailId: forgotEmail })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send reset link");
      }
      setForgotStatus("Password reset link sent! Check your email.");
    } catch (err) {
      setForgotStatus(err.message || "Failed to send reset link");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            {isLogin ? "Welcome Back!" : "Join StudentHub"}
          </h2>
          <p className="text-gray-600 mt-2">
            {isLogin
              ? "Sign in to connect with fellow students"
              : "Create an account to get started"}
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              name="emailId"
              value={formData.emailId}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>

          {isLogin && (
            <div className="flex justify-end -mt-2 mb-2">
              <button
                type="button"
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium focus:outline-none"
                onClick={() => setShowForgotModal(true)}
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button 
            type="submit" 
            className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Please wait...' : (isLogin ? "Sign In" : "Create Account")}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setFormData({
                emailId: "",
                password: "",
                firstName: "",
                lastName: "",
              });
            }}
            className="text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            {isLogin
              ? "Need an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl" onClick={() => { setShowForgotModal(false); setForgotStatus(""); setForgotEmail(""); }}>&times;</button>
            <h3 className="text-xl font-bold mb-4 text-center text-indigo-700">Forgot Password</h3>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Enter your email address</label>
                <input
                  type="email"
                  className="input input-bordered w-full"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className={`btn btn-primary w-full ${forgotLoading ? 'loading' : ''}`} disabled={forgotLoading}>
                {forgotLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            {forgotStatus && <div className="mt-4 text-center text-sm text-indigo-700">{forgotStatus}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
