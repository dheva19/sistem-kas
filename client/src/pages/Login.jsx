import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login gagal. Periksa username dan password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-lg border border-neutral-200 shadow-sm p-6 sm:p-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-neutral-900">Masuk Admin</h1>
          <p className="text-sm text-neutral-500 mt-1">Sistem Pengelolaan Kas</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-neutral-50 border border-neutral-300 text-neutral-800 text-xs leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50"
            >
              {loading ? 'Memverifikasi...' : 'Masuk'}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-neutral-100 text-center">
          <p className="text-xs text-neutral-400">
            Default akun: <code className="text-neutral-700 bg-neutral-100 px-1 py-0.5 rounded">admin</code> / <code className="text-neutral-700 bg-neutral-100 px-1 py-0.5 rounded">admin123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
