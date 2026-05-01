import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Alert from '../components/Alert';
import QRScanner from '../components/QRScanner';
import { Shield, User, Lock, Eye, EyeOff, ArrowRight, BarChart3, Users, QrCode } from 'lucide-react';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, qrLogin } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login({ username, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQRSuccess = async (decodedText) => {
    setLoading(true);
    setError('');
    setShowScanner(false);
    try {
      await qrLogin(decodedText);
      navigate('/check-in');
    } catch (err) {
      setError(err.response?.data?.message || 'QR Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white flex items-center justify-center p-4 md:p-8 font-['Inter',sans-serif] relative overflow-hidden">
      {/* Container - Big Frame with full background image */}
      <div
        className="container w-full max-w-[1250px] min-h-[750px] rounded-[2.5rem] border border-[#0052ff]/40 overflow-hidden shadow-[0_0_40px_rgba(0,82,255,0.2)] relative z-10 m-4 flex flex-col md:flex-row bg-cover bg-center transition-all duration-500"
        style={{ backgroundImage: "url('/z7768508596307_2f26c1319aa107c0e04dee79be275bdf.jpg')" }}
      >
        {/* Left Content overlaid */}
        <div className="left hidden md:flex md:w-[55%] flex-col justify-between p-12 relative z-10">
          <div className="flex items-center space-x-2 opacity-0">
            <Shield size={28} className="text-[#0052ff]" />
            <span className="text-sm font-black tracking-widest text-white/90">SECURE NODE</span>
          </div>

          <div className="left-content mt-auto mb-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            <h1 className="text-4xl font-black text-white tracking-tight leading-none uppercase">
              R&D Access System
            </h1>
            <p className="text-[#0052ff] font-bold text-xs uppercase tracking-wider mt-2">
              HCLTech & ANZ Strategic Portal
            </p>
            <p className="text-white/60 text-xs mt-4 max-w-sm leading-relaxed">
              Secure access to research, innovation and strategic collaboration platform.
            </p>

            {/* Quick Feature Grid */}
            <div className="grid grid-cols-3 gap-4 mt-10 pt-6 border-t border-white/20 max-w-lg">
              <div className="flex flex-col">
                <Shield size={20} className="text-[#0052ff] mb-2" />
                <span className="text-[11px] font-bold text-white">Secure Access</span>
                <span className="text-[10px] text-white/60 mt-1 leading-tight">Enterprise grade protection</span>
              </div>
              <div className="flex flex-col">
                <BarChart3 size={20} className="text-[#0052ff] mb-2" />
                <span className="text-[11px] font-bold text-white">Real-time Insights</span>
                <span className="text-[10px] text-white/60 mt-1 leading-tight">Data-driven decisions</span>
              </div>
              <div className="flex flex-col">
                <Users size={20} className="text-[#0052ff] mb-2" />
                <span className="text-[11px] font-bold text-white">Strategic Collaboration</span>
                <span className="text-[10px] text-white/60 mt-1 leading-tight">Connect. Innovate. Succeed.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Floating Glassmorphic Login Card (rgba 7,19,41,0.7) */}
        <div className="right w-full md:w-[45%] flex items-center justify-center p-6 md:p-8 relative z-10">
          {/* Diffused deep blue glow spreading behind the login box */}
          <div className="absolute w-[85%] h-[80%] bg-[#0052ff]/40 rounded-full blur-[100px] pointer-events-none z-0 animate-pulse"></div>

          <div
            className="login-box w-full max-w-md rounded-[2rem] border border-[#0052ff]/40 p-10 shadow-[0_0_30px_rgba(0,82,255,0.3)] relative z-10 transition-all duration-300 hover:shadow-[0_0_50px_rgba(0,82,255,0.5)] hover:border-[#0052ff]/60 animate-fade-in"
            style={{ backgroundColor: 'rgba(7, 19, 41, 0.7)' }}
          >

            {/* Header Form */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mx-auto mb-4">
                <div className="relative flex items-center justify-center w-14 h-14 text-[#0052ff]">
                  <Shield size={50} className="absolute opacity-20 animate-pulse" />
                  <Shield size={40} className="absolute" />
                  <Lock size={16} className="relative z-10 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-normal text-white tracking-tight uppercase">
                R&D Access System
              </h2>
              <p className="text-xs text-white/70 font-normal uppercase tracking-widest mt-1.5">
                HCLTECH & ANZ STRATEGIC PORTAL
              </p>
              <div className="w-10 h-0.5 bg-[#0052ff] rounded-full mx-auto mt-4"></div>
            </div>
            {error && (
              <div className="mb-6">
                <Alert message={error} type="error" onClose={() => setError('')} duration={5000} />
              </div>
            )}

            {!showScanner ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Username Input */}
                <div className="input-group">
                  <label className="block text-sm font-normal text-white/70 uppercase tracking-wider mb-2">
                    Username
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User size={18} className="text-white/40 group-focus-within:text-[#0052ff] transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-[#0b0f1a]/50 border border-[#0052ff]/20 focus:border-[#0052ff]/60 rounded-xl outline-none text-white transition font-medium text-sm placeholder-white/20 shadow-inner focus:ring-1 focus:ring-[#0052ff]/30"
                      placeholder="security"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="input-group">
                  <label className="block text-sm font-normal text-white/70 uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock size={18} className="text-white/40 group-focus-within:text-[#0052ff] transition-colors" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 bg-[#0b0f1a]/50 border border-[#0052ff]/20 focus:border-[#0052ff]/60 rounded-xl outline-none text-white transition font-medium text-sm placeholder-white/20 shadow-inner focus:ring-1 focus:ring-[#0052ff]/30"
                      placeholder="••••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-[#0052ff]"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#0072ff] to-[#00c6ff] text-white py-3.5 rounded-xl font-bold hover:opacity-95 disabled:opacity-50 transition shadow-lg shadow-[#0072ff]/30 flex items-center justify-center gap-2 text-xs uppercase tracking-widest active:scale-[0.98]"
                >
                  {loading ? 'Processing authentication...' : (
                    <>
                      LOGIN TO PLATFORM
                      <ArrowRight size={16} className="ml-1" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="bg-[#0b0f1a]/40 p-4 rounded-2xl border border-[#00c6ff]/20 shadow-inner">
                <QRScanner
                  onScanSuccess={handleQRSuccess}
                  actionText="Scan your Employee Badge"
                />
              </div>
            )}

            {/* OR Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-[9px]">
                <span className="px-4 bg-transparent text-white/40 uppercase font-black tracking-widest">OR</span>
              </div>
            </div>

            {/* QR Mode Toggle */}
            <button
              type="button"
              onClick={() => setShowScanner(!showScanner)}
              className="w-full bg-transparent hover:bg-[#00c6ff]/10 text-[#00c6ff] hover:text-white py-3 rounded-xl font-bold transition border border-[#00c6ff]/30 hover:border-[#00c6ff] flex items-center justify-center gap-2 text-xs uppercase tracking-widest active:scale-[0.98]"
            >
              <QrCode size={16} />
              {showScanner ? "Login with Credentials" : "Scan Employee Badge (QR Mode)"}
            </button>

            {/* Demo Credentials */}
            <div className="mt-8 text-left text-[11px] text-white/40 border-t border-white/10 pt-6">
              <p className="font-bold uppercase tracking-wider mb-4 text-[#00c6ff] text-center text-xs">DEMO CREDENTIALS</p>
              <div className="flex flex-col space-y-2.5 max-w-xs mx-auto">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white/60">Admin:</span>
                  <span className="font-mono bg-[#0b0f1a]/40 px-3 py-1 rounded-lg border border-[#00c6ff]/20 text-white/90 text-[10px] flex items-center gap-1.5 shadow-sm">
                    <User size={12} className="text-[#00c6ff]" /> admin / admin123
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white/60">Engineer:</span>
                  <span className="font-mono bg-[#0b0f1a]/40 px-3 py-1 rounded-lg border border-[#00c6ff]/20 text-white/90 text-[10px] flex items-center gap-1.5 shadow-sm">
                    <User size={12} className="text-[#00c6ff]" /> engineer1 / engineer123
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white/60">Security:</span>
                  <span className="font-mono bg-[#0b0f1a]/40 px-3 py-1 rounded-lg border border-[#00c6ff]/20 text-white/90 text-[10px] flex items-center gap-1.5 shadow-sm">
                    <User size={12} className="text-[#00c6ff]" /> security / security123
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
