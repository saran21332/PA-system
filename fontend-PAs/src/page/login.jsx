import React, { useState } from 'react';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 
import { jwtDecode } from 'jwt-decode';
import bg from '../assets/city.png';

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit();
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_MY_API}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const token = data.res?.token;
        if (token) {
          const decoded = jwtDecode(token);
          const expiresAt = decoded.exp * 1000;
          const msUntilExpire = expiresAt - Date.now();

          localStorage.setItem('token', token);

          setTimeout(() => {
            localStorage.clear();
            window.location.href = '/login';
          }, msUntilExpire);

          navigate('/Home');
        } else {
          setError("ระบบผิดพลาด: ไม่พบ token");
        }
      } else {
        setError(data.message || "เข้าสู่ระบบล้มเหลว");
      }
    } catch (err) {
      setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#3C4669] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#3C4669]"></div>
      <div className="relative w-full max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row min-h-[600px]">
            <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
              <div className="max-w-md mx-auto w-full">
                <div className="mb-4">
                  <h1 className="text-4xl text-left lg:text-5xl font-bold text-[#3C4669] mb-2 prompt-bold">
                    Welcome.
                  </h1>
                  <p className="text-2xl text-left text-[#3C4669] font-medium prompt-bold">
                    Public Address System
                  </p>
                </div>
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div>
                    <label className="block text-left text-md  text-slate-700 mb-2 prompt-bold">
                      User
                    </label>
                    <div className="relative">
                      <User className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#3C4669]" />
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="User"
                        className="w-full pl-10 pr-4 py-3 border-2 border-[#3C4669] rounded-4xl focus:outline-none focus:ring-2 focus:ring-[#3C4669] focus:border-transparent text-slate-700 placeholder-slate-400"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-left text-md text-[#3C4669] mb-2 prompt-bold">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#3C4669]" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Password"
                        className="w-full pl-10 pr-4 py-3 border-2 border-[#3C4669] rounded-4xl focus:outline-none focus:ring-2 focus:ring-[#3C4669] focus:border-transparent text-slate-700 placeholder-slate-400"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 pr-3"
                      >
                        {showPassword ? 
                          <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" /> : 
                          <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                        }
                      </button>
                    </div>
                  </div>
                  {error && (
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded-xl border border-red-200">
                      {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isLoading || !formData.username || !formData.password}
                    className="w-full bg-gradient-to-r from-[#AD7CE1] to-[#EC77BA] text-white py-4 px-6 rounded-4xl font-medium text-lg hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'Login'}
                  </button>

                </form>
              </div>
            </div>
            <div className="w-full lg:w-1/2 bg-white relative overflow-hidden flex items-center justify-center -ml-4 lg:-ml-20">
              <div className="relative z-10 flex items-center justify-center h-full w-full">
                <img 
                  src={bg} 
                  alt="Public Address System Illustration"
                  className="w-150 h-150 object-contain"
                />
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
  );
}