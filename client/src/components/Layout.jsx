import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  ArrowDownCircle,
  Settings,
  LogOut,
  Menu,
  X,
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
    { name: 'Status Kas Bulanan', path: '/tracking', icon: CheckSquare },
    { name: 'Data Anggota', path: '/members', icon: Users },
    { name: 'Pengeluaran', path: '/expenses', icon: ArrowDownCircle },
    { name: 'Pengaturan', path: '/config', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col md:flex-row text-neutral-800 antialiased font-sans">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-neutral-200 shrink-0">
        <div className="h-16 px-6 flex items-center border-b border-neutral-200">
          <div>
            <span className="font-semibold text-neutral-900 tracking-tight text-base">Kas Organisasi</span>
            <span className="block text-[11px] text-neutral-400">Panel Pembukuan</span>
          </div>
        </div>

        <nav className="p-3 flex-1 space-y-0.5">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? 'bg-neutral-900 text-white font-medium'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-neutral-200 bg-neutral-50/50">
          <div className="flex items-center justify-between px-2 py-1">
            <div className="truncate pr-2">
              <p className="text-xs font-medium text-neutral-900 truncate">{admin?.name || 'Admin'}</p>
              <p className="text-[11px] text-neutral-500">@{admin?.username || 'admin'}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Keluar"
              className="p-1.5 text-neutral-400 hover:text-neutral-800 hover:bg-neutral-200 rounded transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Header Mobile */}
      <header className="md:hidden bg-white border-b border-neutral-200 flex items-center justify-between px-4 h-14 sticky top-0 z-30">
        <span className="font-semibold text-sm text-neutral-900">Kas Organisasi</span>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 text-neutral-600 hover:text-neutral-900 rounded"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-neutral-200 px-4 py-3 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                    isActive ? 'bg-neutral-900 text-white font-medium' : 'text-neutral-600 hover:bg-neutral-100'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
          <div className="pt-2 border-t border-neutral-100 mt-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 rounded-md"
            >
              <LogOut className="w-4 h-4" />
              Keluar
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto min-h-[calc(100vh-3.5rem)] md:min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
