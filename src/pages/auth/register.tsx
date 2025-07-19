import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import BASE_URL from "../../config";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "",
    password: "",
    confirmPassword: ""
  });
  
  const [onboardingData, setOnboardingData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });
  
  const [activeTab, setActiveTab] = useState<'register' | 'onboard'>('register');
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [onboardingStatus, setOnboardingStatus] = useState<{
    checking: boolean;
    eligible: boolean;
    message: string;
    userName?: string;
    role?: string;
  }>({
    checking: false,
    eligible: false,
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, login, loading } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleOnboardingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOnboardingData({
      ...onboardingData,
      [e.target.name]: e.target.value
    });
  };

  const handleCheckEmail = async () => {
    if (!onboardingData.email) {
      setError("Please enter your email address");
      return;
    }

    setOnboardingStatus({
      ...onboardingStatus,
      checking: true,
      message: ""
    });

    try {
      const response = await axios.post(`${BASE_URL}/api/users/check-onboarding`, {
        email: onboardingData.email
      });

      setOnboardingStatus({
        checking: false,
        eligible: response.data.eligible,
        message: response.data.message,
        userName: response.data.name,
        role: response.data.role
      });
      
      setError("");
    } catch (error: any) {
      setOnboardingStatus({
        checking: false,
        eligible: false,
        message: error.response?.data?.message || "Error checking email"
      });
      setError(error.response?.data?.message || "Error checking email");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate required fields
    if (!formData.name || !formData.email || !formData.gender || !formData.password) {
      setError("Please fill in all required fields");
      return;
    }

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      await register(formData.name, formData.email, formData.gender, formData.password);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Registration failed");
    }
  };

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Validate passwords match
    if (onboardingData.password !== onboardingData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (onboardingData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(`${BASE_URL}/api/users/onboard-setup`, {
        email: onboardingData.email,
        password: onboardingData.password,
        confirmPassword: onboardingData.confirmPassword
      });

      setMessage(response.data.message || "Password set successfully");
      
      // Log user in
      await login(onboardingData.email, onboardingData.password);
      
    } catch (error: any) {
      setError(error.response?.data?.message || "Error setting password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg"
      >
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link to="/login" className="font-medium text-teal-600 hover:text-teal-500">
              sign in to your account
            </Link>
          </p>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-gray-200 gap-4">
          <button
            type="button"
            className={`py-2 px-4 flex-1 text-center ${
              activeTab === 'register'
                ? 'border-b-2 border-teal-500 text-teal-600 font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => {
              setActiveTab('register');
              setError("");
              setMessage("");
            }}
          >
            New User
          </button>
          <button
            type="button"
            className={`py-2 px-4 flex-1 text-center ${
              activeTab === 'onboard'
                ? 'border-b-2 border-teal-500 text-teal-600 font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => {
              setActiveTab('onboard');
              setError("");
              setMessage("");
              setOnboardingStatus({
                checking: false,
                eligible: false,
                message: ""
              });
            }}
          >
            Hospital Staff
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{message}</span>
          </div>
        )}

        {activeTab === 'register' ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-lg text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                {loading ? "Creating account..." : "Sign up"}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-8 space-y-6">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                If you were added to a hospital staff via CSV onboarding, enter your email to set up your password.
              </p>
              
              {!onboardingStatus.eligible ? (
                // Email check form
                <div className="space-y-4">
                  <div>
                    <label htmlFor="onboard-email" className="block text-sm font-medium text-gray-700">
                      Email address
                    </label>
                    <input
                      id="onboard-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={onboardingData.email}
                      onChange={handleOnboardingChange}
                      className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                      placeholder="john@example.com"
                    />
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleCheckEmail}
                    disabled={onboardingStatus.checking || !onboardingData.email}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                  >
                    {onboardingStatus.checking ? "Checking..." : "Check Email"}
                  </button>
                  
                  {onboardingStatus.message && !error && (
                    <div className="text-sm text-gray-600 mt-2">
                      {onboardingStatus.message}
                    </div>
                  )}
                </div>
              ) : (
                // Password setup form
                <form onSubmit={handleOnboardingSubmit} className="space-y-4">
                  {onboardingStatus.userName && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-blue-800 font-medium">Welcome, {onboardingStatus.userName}!</p>
                      <p className="text-sm text-blue-600">
                        You are setting up your account as a {onboardingStatus.role}. Please create a password to continue.
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="onboard-password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      id="onboard-password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={onboardingData.password}
                      onChange={handleOnboardingChange}
                      className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="onboard-confirm-password" className="block text-sm font-medium text-gray-700">
                      Confirm Password
                    </label>
                    <input
                      id="onboard-confirm-password"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={onboardingData.confirmPassword}
                      onChange={handleOnboardingChange}
                      className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                  >
                    {isSubmitting ? "Setting up..." : "Set Password & Login"}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setOnboardingStatus({
                        checking: false,
                        eligible: false,
                        message: ""
                      });
                      setOnboardingData({
                        ...onboardingData,
                        password: "",
                        confirmPassword: ""
                      });
                    }}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Back
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
} 