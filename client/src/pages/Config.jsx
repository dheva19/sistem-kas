import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { formatRupiah } from '../utils/helpers';

export default function Config() {
  const [formData, setFormData] = useState({
    monthlyDues: 30000,
    qrCodeImage: '',
    qrCodeNote: '',
    bankInfo: '',
  });

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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

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
        setSuccessMsg('Pengaturan kas berhasil disimpan.');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal menyimpan pengaturan');
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
        setPasswordMsg('Profil / password berhasil diubah.');
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
      <div className="p-8 text-center text-xs text-neutral-400">
        Memuat pengaturan...
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-neutral-200">
        <h1 className="text-xl font-semibold text-neutral-900">Pengaturan Sistem</h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Konfigurasi nominal iuran, gambar QRIS pembayaran, dan akun admin
        </p>
      </div>

      {successMsg && (
        <div className="p-3 rounded-md bg-neutral-50 border border-neutral-300 text-neutral-800 text-xs">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-md bg-neutral-50 border border-neutral-300 text-neutral-800 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Form Konfigurasi Kas & QR */}
      <div className="bg-white rounded-md border border-neutral-200 p-5 sm:p-6">
        <form onSubmit={handleSaveConfig} className="space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900 pb-2 border-b border-neutral-100">
              Iuran & QR Pembayaran
            </h2>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Nominal Iuran Kas Per Bulan (Rp)
            </label>
            <div className="max-w-xs">
              <input
                type="number"
                required
                min="0"
                value={formData.monthlyDues}
                onChange={(e) => setFormData({ ...formData, monthlyDues: Number(e.target.value) })}
                className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-md text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
              />
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              Standar: {formatRupiah(formData.monthlyDues)} / bulan
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Gambar QR Code Pembayaran
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-2">
              {formData.qrCodeImage ? (
                <div className="relative">
                  <img
                    src={formData.qrCodeImage}
                    alt="QR Code"
                    className="w-32 h-32 object-contain bg-white p-1 border border-neutral-300 rounded"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, qrCodeImage: '' })}
                    className="mt-1 block text-xs text-neutral-500 hover:text-neutral-900 underline"
                  >
                    Hapus gambar
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 border border-dashed border-neutral-300 rounded flex items-center justify-center text-xs text-neutral-400 bg-neutral-50">
                  Tidak ada QR
                </div>
              )}

              <div>
                <label className="inline-block px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-md text-xs font-medium text-neutral-700 cursor-pointer">
                  Pilih Gambar QR
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-neutral-400 mt-1.5">Maksimal ukuran file: 2MB (PNG / JPG / WEBP)</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Keterangan / Petunjuk QR
              </label>
              <input
                type="text"
                placeholder="Misal: Scan QRIS a.n Kas Angkatan"
                value={formData.qrCodeNote}
                onChange={(e) => setFormData({ ...formData, qrCodeNote: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-md text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Rekening / E-Wallet Alternatif
              </label>
              <input
                type="text"
                placeholder="BCA: 1234567890 / DANA: 08123456"
                value={formData.bankInfo}
                onChange={(e) => setFormData({ ...formData, bankInfo: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-md text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-md text-xs font-medium transition-colors disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </div>
        </form>
      </div>

      {/* Akun Admin */}
      <div className="bg-white rounded-md border border-neutral-200 p-5 sm:p-6">
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <h2 className="text-sm font-semibold text-neutral-900 pb-2 border-b border-neutral-100">
            Akun & Keamanan Admin
          </h2>

          {passwordMsg && (
            <div className="p-2.5 rounded bg-neutral-50 border border-neutral-300 text-neutral-800 text-xs">
              {passwordMsg}
            </div>
          )}

          {passwordError && (
            <div className="p-2.5 rounded bg-neutral-50 border border-neutral-300 text-neutral-800 text-xs">
              {passwordError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Nama Tampilan
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-md text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Password Saat Ini
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={profileData.currentPassword}
                onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-md text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Password Baru
              </label>
              <input
                type="password"
                placeholder="Kosongkan jika tidak diganti"
                value={profileData.newPassword}
                onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-md text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-100 flex justify-end">
            <button
              type="submit"
              disabled={savingPassword}
              className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-md text-xs font-medium transition-colors disabled:opacity-50"
            >
              {savingPassword ? 'Memperbarui...' : 'Perbarui Profil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
