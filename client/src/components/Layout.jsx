import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Receipt,
  Settings,
  LogOut,
  Menu,
  X,
  Wallet,
} from 'lucide-react';

export default function Layout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Status Kas Bulanan', path: '/tracking', icon: CreditCard },
    { name: 'Data Anggota', path: '/members', icon: Users },
    { name: 'Pengeluaran Kas', path: '/expenses', icon: Receipt },
    { name: 'Konfigurasi', path: '/config', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white border-r border-slate-800 shadow-xl shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800/80">
          <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-md flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wide text-white">KAS KITA</h1>
            <p className="text-xs text-slate-400">Manajemen Kas MERN</p>
          </div>
        </div>

        <div className="px-4 py-6 flex-1 space-y-1.5">
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Menu Utama</p>
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center justify-between mb-3 px-2">
            <div>
              <p className="text-sm font-semibold text-white truncate max-w-[130px]">{admin?.name || 'Admin'}</p>
              <p className="text-xs text-slate-400">@{admin?.username || 'admin'}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-slate-900 text-white flex items-center justify-between p-4 sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="font-bold tracking-wide">KAS KITA</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-300 hover:text-white rounded-lg focus:outline-none"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-xs flex flex-col justify-between pt-16 p-6">
          <div className="space-y-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                      isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
          <div className="border-t border-slate-800 pt-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 bg-rose-600/20 text-rose-300 rounded-xl font-medium"
            >
              <LogOut className="w-5 h-5" />
              Keluar (Logout)
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
