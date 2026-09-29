import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Menu, X } from "lucide-react";
import { useLocation, matchPath } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { panelName } = useSettings();

  const isServerView = matchPath("/servers/:id/*", location.pathname) && !matchPath("/servers/create", location.pathname);

  if (isServerView) {
    return (
      <div className="flex h-[100dvh] w-full bg-[#030305] text-zinc-100 font-sans overflow-hidden selection:bg-indigo-500/30">
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
          <main className="flex-1 overflow-hidden w-full h-full relative z-10">
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] w-full bg-[#030305] text-zinc-100 font-sans overflow-hidden selection:bg-indigo-500/30">
      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" 
          onClick={() => setMobileOpen(false)} 
        />
      )}
      
      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 z-50 transform flex-shrink-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <Sidebar onClose={() => setMobileOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* Subtle background glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-[#0a0a0c]/80 backdrop-blur-md border-b border-white/5 flex-shrink-0 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-500/40 shadow-[0_0_12px_rgba(249,115,22,0.4)] bg-black/60 flex-shrink-0">
              <img src="/logo.png" alt="FireCloud Logo" className="w-full h-full object-cover scale-110" />
            </div>
            <h1 className="text-lg font-extrabold tracking-tight text-white truncate bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 bg-clip-text text-transparent">
              {panelName}
            </h1>
          </div>
          <button onClick={() => setMobileOpen(true)} className="p-2 text-zinc-400 hover:text-white bg-white/5 rounded-lg transition-colors">
            <Menu size={20} />
          </button>
        </div>
        
        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto w-full h-full pb-safe relative z-10 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
