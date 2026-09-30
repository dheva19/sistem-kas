import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { formatRupiah } from '../utils/helpers';
import {
  Settings,
  QrCode,
  DollarSign,
  Upload,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Save,
  Lock,
} from 'lucide-react';

export default function Config() {
  const [formData, setFormData] = useState({
    monthlyDues: 30000,
    qrCodeImage: '',
    qrCodeNote: '',
    bankInfo: '',
  });

  // Admin password change form
  const [profileData, setProfileData] = useState({
    name: '',
    currentPassword: '',
    newPassword: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Fetch current config
  const fetchConfigAndProfile = async () => {
    try {
      setLoading(true);
      const [configRes, meRes] = await Promise.all([
        api.get('/config'),
        api.get('/auth/me'),
      ]);

      if (configRes.data.success) {
        setFormData({
          monthlyDues: configRes.data.data.monthlyDues || 30000,
          qrCodeImage: configRes.data.data.qrCodeImage || '',
          qrCodeNote: configRes.data.data.qrCodeNote || '',
          bankInfo: configRes.data.data.bankInfo || '',
        });
      }

      if (meRes.data.success) {
        setProfileData((prev) => ({ ...prev, name: meRes.data.admin.name || '' }));
      }
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigAndProfile();
  }, []);

  // Handle Image Upload & Convert to Base64
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit (max 2MB for base64 storage)
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Ukuran file QR code maksimal 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, qrCodeImage: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setSaving(true);

    try {
      const res = await api.put('/config', formData);
      if (res.data.success) {
        setSuccessMsg('Konfigurasi kas dan QR code berhasil disimpan!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal menyimpan konfigurasi');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordError('');
    setSavingPassword(true);

    try {
      const res = await api.put('/auth/profile', profileData);
      if (res.data.success) {
        setPasswordMsg('Password / Nama admin berhasil diperbarui!');
        setProfileData((prev) => ({ ...prev, currentPassword: '', newPassword: '' }));
        setTimeout(() => setPasswordMsg(''), 4000);
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Gagal mengubah password');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Konfigurasi Sistem</h1>
        <p className="text-sm text-slate-500 mt-1">
          Atur nominal kas per bulan, unggah gambar QRIS / rekening pembayaran, dan keamanan admin
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Configuration Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 md:p-8">
        <form onSubmit={handleSaveConfig} className="space-y-6">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <DollarSign className="w-5 h-5 text-indigo-600" />
            Pengaturan Iuran & Pembayaran
          </h2>

          {/* Nominal Kas Per Bulan */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Nominal Iuran Kas Per Bulan (Rp)
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Nominal standar yang akan digunakan untuk tracking status lunas dan pembayaran kas bulanan.
            </p>
            <div className="relative max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-semibold text-sm">
                Rp
              </div>
              <input
                type="number"
                required
                min="0"
                value={formData.monthlyDues}
                onChange={(e) => setFormData({ ...formData, monthlyDues: Number(e.target.value) })}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
            <p className="text-xs text-indigo-600 mt-1 font-medium">
              Terbaca: {formatRupiah(formData.monthlyDues)} / bulan
            </p>
          </div>

          {/* QR Code Pembayaran */}
          <div className="border-t border-slate-100 pt-6">
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Kode QR Pembayaran (QRIS / Bank)
            </label>
            <p className="text-xs text-slate-500 mb-3">
              Unggah file gambar kode QR (PNG/JPG). Gambar ini akan otomatis muncul pada pop-up pembayaran kas.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {formData.qrCodeImage ? (
                <div className="relative group">
                  <img
                    src={formData.qrCodeImage}
                    alt="QR Code Kas"
                    className="w-40 h-40 object-contain rounded-xl border border-slate-300 bg-white p-2 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, qrCodeImage: '' })}
                    className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-1 shadow-md hover:bg-rose-700"
                    title="Hapus Gambar QR"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="w-40 h-40 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                  <QrCode className="w-10 h-10 mb-1" />
                  <span className="text-xs">Belum ada QR</span>
                </div>
              )}

              <div className="space-y-3">
                <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium cursor-pointer transition-colors border border-slate-300">
                  <Upload className="w-4 h-4" />
                  <span>Pilih & Upload Gambar QR</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-slate-400">Format yang didukung: JPG, PNG, WEBP (Maksimal 2MB)</p>
              </div>
            </div>
          </div>

          {/* Keterangan QR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Catatan Petunjuk QRIS
              </label>
              <input
                type="text"
                placeholder="Contoh: Scan QRIS atas nama Kas Angkatan 2024"
                value={formData.qrCodeNote}
                onChange={(e) => setFormData({ ...formData, qrCodeNote: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Nomor Rekening / E-Wallet Alternatif
              </label>
              <input
                type="text"
                placeholder="Contoh: BCA 1234567890 a.n Budi / DANA 08123456789"
                value={formData.bankInfo}
                onChange={(e) => setFormData({ ...formData, bankInfo: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors shadow-xs disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Menyimpan...' : 'Simpan Konfigurasi Kas'}
            </button>
          </div>
        </form>
      </div>

      {/* Admin Security Settings */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 md:p-8">
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Lock className="w-5 h-5 text-indigo-600" />
            Keamanan Akun Admin
          </h2>

          {passwordMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{passwordMsg}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{passwordError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Nama Tampilan Admin
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Password Saat Ini
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={profileData.currentPassword}
                onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Password Baru
              </label>
              <input
                type="password"
                placeholder="Kosongkan jika tidak diubah"
                value={profileData.newPassword}
                onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={savingPassword}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
            >
              {savingPassword ? 'Memperbarui...' : 'Perbarui Akun Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
