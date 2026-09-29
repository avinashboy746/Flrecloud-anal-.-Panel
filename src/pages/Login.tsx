import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Server } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const { panelName } = useSettings();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/auth/login", { username, password });
      login(res.data.token, res.data.user);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030305] font-sans relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-amber-500/15 via-orange-600/15 to-rose-600/10 blur-[160px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 300, damping: 25 }}
        className="max-w-[420px] w-full bg-[#0a0a0c]/90 backdrop-blur-2xl p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-amber-500/20 relative z-10 m-4 overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
        
        <div className="flex flex-col items-center mb-8 mt-1 text-center">
          <div className="relative mb-4 group">
            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 opacity-75 blur-md group-hover:opacity-100 transition duration-500 animate-pulse" />
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-amber-400/70 shadow-2xl bg-black">
              <img 
                src="/logo.png" 
                alt="FireCloud Logo" 
                className="w-full h-full object-cover scale-105" 
              />
            </div>
          </div>
          <h2 className="text-3xl font-black tracking-tight bg-gradient-to-r from-amber-300 via-orange-400 to-rose-500 bg-clip-text text-transparent">
            {panelName}
          </h2>
          <p className="text-orange-400/90 mt-1 text-xs font-bold uppercase tracking-widest">
            Premium Hosting &bull; Zero Limits
          </p>
          <p className="text-zinc-400 mt-2 text-xs">
            Enter your credentials to manage game servers
          </p>
        </div>
        
        {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl text-sm mb-6 text-center font-medium shadow-inner"
            >
              {error}
            </motion.div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Username</label>
            <input 
              type="text" 
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Password</label>
            <input 
              type="password" 
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full bg-white text-zinc-900 font-bold rounded-xl px-4 py-3.5 transition-all mt-4 hover:bg-zinc-200 active:scale-[0.98] shadow-lg shadow-white/10">
            Sign In
          </button>
        </form>
      </motion.div>
    </div>
  );
}
