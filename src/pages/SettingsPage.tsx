import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, User, Trash2, Layout, Terminal, Check, Copy, Flame, BookOpen } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const { panelName, fetchSettings } = useSettings();
  const [users, setUsers] = useState<any[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [newPanelName, setNewPanelName] = useState(panelName);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [copiedStep, setCopiedStep] = useState<string | null>(null);

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(id);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  useEffect(() => {
    setNewPanelName(panelName);
  }, [panelName]);

  const fetchUsers = async () => {
    if (user.role !== "admin") return;
    try {
      const res = await axios.get("/api/system/users");
      setUsers(res.data);
    } catch (e) {}
  };

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/system/users", { username, password, role });
      setUsername("");
      setPassword("");
      fetchUsers();
      showNotification("Identity created successfully", "success");
    } catch (e: any) {
      showNotification(e.response?.data?.error || "Error creating user", "error");
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await axios.delete(`/api/system/users/${id}`);
      fetchUsers();
      showNotification("Identity revoked successfully", "success");
    } catch (e) {
      showNotification("Failed to revoke identity", "error");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="p-5 md:p-10 max-w-7xl mx-auto"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl border font-medium text-sm shadow-2xl flex items-center gap-3 backdrop-blur-xl ${
              notification.type === 'success' 
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200' 
                : 'bg-rose-950/90 border-rose-500/40 text-rose-200'
            }`}
          >
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-500/50 shadow-[0_0_15px_rgba(249,115,22,0.4)] bg-black/60 flex-shrink-0">
              <img src="/logo.png" alt="FireCloud Logo" className="w-full h-full object-cover scale-110" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Settings & Guide</h1>
          </div>
          <p className="text-zinc-400">Configure your account, panel branding, and review setup instructions.</p>
        </div>
      </div>

      <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 md:p-8 mb-8 shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full pointer-events-none" />
        
        <h2 className="text-xl font-bold mb-6 flex items-center text-white relative z-10">
          <User className="mr-3 text-orange-400 w-5 h-5" /> Account Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div className="bg-white/[0.02] p-4 border border-white/5 rounded-xl">
            <p className="text-sm font-medium text-zinc-500 mb-1">Username</p>
            <p className="text-lg font-semibold text-zinc-200">{user.username}</p>
          </div>
          <div className="bg-white/[0.02] p-4 border border-white/5 rounded-xl">
            <p className="text-sm font-medium text-zinc-500 mb-1">Access Role</p>
            <p className="text-lg font-semibold text-zinc-200 capitalize flex items-center gap-2">
              {user.role}
              {user.role === 'admin' && <Shield size={14} className="text-orange-400" />}
            </p>
          </div>
        </div>
      </div>

      {user.role === "admin" && (
        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 md:p-8 mb-8 shadow-xl relative overflow-hidden">
          <h2 className="text-xl font-bold mb-6 flex items-center text-white relative z-10">
            <Layout className="mr-3 text-amber-400 w-5 h-5" /> Platform Branding
          </h2>
          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await axios.put("/api/system/settings", { panelName: newPanelName });
                fetchSettings();
                showNotification("Branding updated successfully", "success");
              } catch (err: any) {
                showNotification(err.response?.data?.error || "Error updating settings", "error");
              }
            }}
            className="relative z-10"
          >
            <div className="max-w-md">
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">Panel Name</label>
              <div className="flex gap-3">
                <input 
                  required 
                  value={newPanelName} 
                  onChange={e => setNewPanelName(e.target.value)} 
                  type="text" 
                  className="flex-1 bg-white/[0.03] border border-white/10 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 rounded-xl px-4 py-2.5 text-white transition-all shadow-inner outline-none" 
                />
                <button type="submit" className="bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold px-6 py-2.5 rounded-xl transition-all shadow-md hover:from-amber-400 hover:to-orange-400 active:scale-[0.98] whitespace-nowrap">
                  Save
                </button>
              </div>
              <p className="text-xs text-zinc-500 mt-2">Display name shown in sidebar, tab title, and authentication screens.</p>
            </div>
          </form>
        </div>
      )}

      {/* Installation & VPS Setup Guide Section */}
      <div className="bg-[#0a0a0c] border border-amber-500/20 rounded-2xl p-6 md:p-8 mb-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
        
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="p-2.5 bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 rounded-xl text-amber-400">
            <BookOpen size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              FireCloud Panel Installation Guide
              <span className="text-[10px] uppercase font-bold tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full">
                VPS / Ubuntu / Debian
              </span>
            </h2>
            <p className="text-sm text-zinc-400">Step-by-step instructions to install and host FireCloud Panel on your own Linux server.</p>
          </div>
        </div>

        <div className="space-y-6 relative z-10">
          {/* Step 1 */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">1</span>
                Update System & Install Node.js 20 + Docker
              </h3>
              <button 
                onClick={() => copyToClipboard(`sudo apt update && sudo apt upgrade -y\ncurl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -\nsudo apt install -y nodejs git docker.io\nsudo systemctl enable --now docker\nsudo usermod -aG docker $USER`, "step1")}
                className="text-xs flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 transition-colors"
              >
                {copiedStep === "step1" ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copiedStep === "step1" ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="bg-black/60 p-3.5 rounded-lg text-xs font-mono text-amber-300/90 overflow-x-auto border border-white/5">
              <code>{`sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git docker.io
sudo systemctl enable --now docker
sudo usermod -aG docker $USER`}</code>
            </pre>
          </div>

          {/* Step 2 */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">2</span>
                Clone Repository & Install Dependencies
              </h3>
              <button 
                onClick={() => copyToClipboard(`git clone https://github.com/avinashboy746/Jtg.git firecloud\ncd firecloud\nnpm install`, "step2")}
                className="text-xs flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 transition-colors"
              >
                {copiedStep === "step2" ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copiedStep === "step2" ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="bg-black/60 p-3.5 rounded-lg text-xs font-mono text-amber-300/90 overflow-x-auto border border-white/5">
              <code>{`git clone https://github.com/avinashboy746/Jtg.git firecloud
cd firecloud
npm install`}</code>
            </pre>
          </div>

          {/* Step 3 */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">3</span>
                Create Admin Account & Build
              </h3>
              <button 
                onClick={() => copyToClipboard(`npm run build\nnpx tsx scripts/createuser.ts`, "step3")}
                className="text-xs flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 transition-colors"
              >
                {copiedStep === "step3" ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copiedStep === "step3" ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="bg-black/60 p-3.5 rounded-lg text-xs font-mono text-amber-300/90 overflow-x-auto border border-white/5">
              <code>{`npm run build
npx tsx scripts/createuser.ts`}</code>
            </pre>
          </div>

          {/* Step 4 */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">4</span>
                Run 24/7 in Background using PM2
              </h3>
              <button 
                onClick={() => copyToClipboard(`sudo npm install -g pm2\npm2 start ecosystem.config.cjs\npm2 save\npm2 startup`, "step4")}
                className="text-xs flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 transition-colors"
              >
                {copiedStep === "step4" ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copiedStep === "step4" ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="bg-black/60 p-3.5 rounded-lg text-xs font-mono text-amber-300/90 overflow-x-auto border border-white/5">
              <code>{`sudo npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup`}</code>
            </pre>
            <p className="text-xs text-zinc-400 mt-2">
              Access your panel in browser at: <span className="text-orange-400 font-mono">http://YOUR_SERVER_IP:3000</span>
            </p>
          </div>
        </div>
      </div>

      {user.role === "admin" && (
        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
          <h2 className="text-xl font-bold mb-8 flex items-center text-white relative z-10">
            <Shield className="mr-3 text-orange-400 w-5 h-5" /> Administrator Controls
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
            <div className="lg:col-span-4 lg:border-r border-white/5 lg:pr-8">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-zinc-500 mb-6">Provision Identity</h3>
              <form onSubmit={createUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1.5">Username</label>
                  <input required value={username} onChange={e=>setUsername(e.target.value)} type="text" className="w-full bg-white/[0.03] border border-white/10 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 rounded-xl px-4 py-2.5 text-white transition-all shadow-inner outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1.5">Password</label>
                  <input required minLength={4} value={password} onChange={e=>setPassword(e.target.value)} type="password" className="w-full bg-white/[0.03] border border-white/10 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 rounded-xl px-4 py-2.5 text-white transition-all shadow-inner outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1.5">Role Privileges</label>
                  <select value={role} onChange={e=>setRole(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 rounded-xl px-4 py-2.5 text-white transition-all shadow-inner outline-none">
                    <option value="user" className="bg-zinc-900">Standard User</option>
                    <option value="admin" className="bg-zinc-900">Administrator</option>
                  </select>
                </div>
                <button type="submit" className="w-full mt-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold py-2.5 rounded-xl transition-all shadow-md hover:from-amber-400 hover:to-orange-400 active:scale-[0.98]">
                  Create Identity
                </button>
              </form>
            </div>

            <div className="lg:col-span-8">
               <h3 className="font-semibold text-sm uppercase tracking-wider text-zinc-500 mb-6 flex items-center justify-between">
                <span>Active Identities ({users.length})</span>
              </h3>
               <div className="space-y-3">
                 {users.map(u => (
                   <div key={u.id} className="flex justify-between items-center p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-colors">
                      <div>
                        <p className="font-medium text-white flex items-center">
                          {u.username}
                          {u.id === user.id && <span className="ml-3 text-[10px] uppercase font-bold tracking-wider bg-orange-500/20 text-orange-400 px-2.5 py-0.5 rounded border border-orange-500/20">You</span>}
                        </p>
                        <p className={`text-xs mt-1 capitalize font-medium ${u.role === 'admin' ? 'text-orange-400' : 'text-zinc-500'}`}>
                           Role: {u.role}
                        </p>
                      </div>
                      {u.id !== user.id && (
                        <button onClick={() => deleteUser(u.id)} className="p-2.5 text-zinc-500 bg-white/[0.03] border border-transparent hover:border-red-500/30 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all" title="Revoke access">
                          <Trash2 size={16} />
                        </button>
                      )}
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      )}

    </motion.div>
  );
}
