import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { formatRupiah, getMonthName, formatDate, exportToExcel, exportToCSV } from '../utils/helpers';
import {
  Calendar,
  CheckCircle,
  XCircle,
  QrCode,
  Download,
  Search,
  Filter,
  CreditCard,
  X,
  AlertCircle,
  DollarSign,
  Info,
} from 'lucide-react';

export default function Tracking() {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [batchYear, setBatchYear] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, paid, unpaid

  const [trackingData, setTrackingData] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal State for Payment / QR
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(30000);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Fetch Config (for default monthlyDues and QR Image)
  const fetchConfig = async () => {
    try {
      const res = await api.get('/config');
      if (res.data.success) {
        setConfig(res.data.data);
        setPaymentAmount(res.data.data.monthlyDues || 30000);
      }
    } catch (err) {
      console.error('Failed to load config', err);
    }
  };

  // Fetch Monthly Tracking
  const fetchTracking = async () => {
    try {
      setLoading(true);
      const params = { month, year };
      if (batchYear) params.batchYear = batchYear;

      const res = await api.get('/payments/tracking', { params });
      if (res.data.success) {
        setTrackingData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load tracking data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  useEffect(() => {
    fetchTracking();
  }, [month, year, batchYear]);

  // Open Payment modal
  const handleOpenPaymentModal = (item) => {
    setSelectedMember(item.member);
    setPaymentAmount(config?.monthlyDues || 30000);
    setNotes('');
    setModalError('');
    setIsModalOpen(true);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setModalError('');
    setSubmitting(true);

    try {
      await api.post('/payments', {
        memberId: selectedMember._id,
        month,
        year,
        amount: paymentAmount,
        notes,
      });
      setIsModalOpen(false);
      fetchTracking();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Gagal mencatat pembayaran');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete payment
  const handleDeletePayment = async (paymentId, memberName) => {
    if (window.confirm(`Batalkan / hapus catatan pembayaran kas ${memberName} untuk periode ini?`)) {
      try {
        await api.delete(`/payments/${paymentId}`);
        fetchTracking();
      } catch (err) {
        alert(err.response?.data?.message || 'Gagal membatalkan pembayaran');
      }
    }
  };

  // Filtered List
  const filteredList = (trackingData?.trackingList || []).filter((item) => {
    const matchName = item.member.name.toLowerCase().includes(search.toLowerCase());
    if (!matchName) return false;

    if (filterStatus === 'paid') return item.isPaid;
    if (filterStatus === 'unpaid') return !item.isPaid;
    return true;
  });

  const handleExport = (format) => {
    if (!trackingData) return;

    const exportRows = filteredList.map((item, idx) => ({
      No: idx + 1,
      Nama: item.member.name,
      Angkatan: item.member.batchYear,
      'Bulan & Tahun': `${getMonthName(month)} ${year}`,
      'Status Kas': item.isPaid ? 'Lunas' : 'Belum Bayar',
      'Nominal Iuran': item.isPaid ? item.paymentInfo.amount : (config?.monthlyDues || 30000),
      'Waktu Bayar': item.isPaid ? formatDate(item.paymentInfo.paidAt) : '-',
      Catatan: item.paymentInfo?.notes || '-',
    }));

    const fileName = `Status_Kas_${getMonthName(month)}_${year}`;
    if (format === 'excel') {
      exportToExcel(exportRows, fileName);
    } else {
      exportToCSV(exportRows, fileName);
    }
  };

  // Generate years list for dropdown
  const years = [currentDate.getFullYear() - 1, currentDate.getFullYear(), currentDate.getFullYear() + 1];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Status Kas Bulanan</h1>
          <p className="text-sm text-slate-500 mt-1">
            Tracking kepatuhan kas anggota bulan <span className="font-semibold text-slate-700">{getMonthName(month)} {year}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleExport('excel')}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            Excel
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-medium transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
        </div>
      </div>

      {/* Control Bar: Bulan, Tahun, Filter Status, Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        {/* Bulan & Tahun */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Bulan</label>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {getMonthName(m)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Tahun</label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Status Bayar */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Filter Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Semua Anggota</option>
            <option value="paid">Hanya yang Sudah Bayar (Lunas)</option>
            <option value="unpaid">Hanya yang Belum Bayar</option>
          </select>
        </div>

        {/* Search */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Cari Anggota</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ketik nama..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Overview Cards Bulan Terpilih */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Anggota</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{trackingData?.totalMembers || 0}</p>
          </div>
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
            <Filter className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Sudah Bayar (Lunas)</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{trackingData?.paidCount || 0}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-600">Belum Bayar</p>
            <p className="text-2xl font-bold text-rose-700 mt-1">{trackingData?.unpaidCount || 0}</p>
          </div>
          <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tracking Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-xs tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4">Nama Anggota</th>
                <th className="py-3.5 px-4">Angkatan</th>
                <th className="py-3.5 px-4">Status Kas</th>
                <th className="py-3.5 px-4">Waktu Bayar</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p>Memuat status kas...</p>
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    Tidak ada anggota yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredList.map((item, idx) => (
                  <tr key={item.member._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 text-center text-slate-400">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-800 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                        {item.member.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{item.member.name}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {item.member.batchYear}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {item.isPaid ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Lunas ({formatRupiah(item.paymentInfo.amount)})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3.5 h-3.5" />
                          Belum Bayar
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs">
                      {item.isPaid ? formatDate(item.paymentInfo.paidAt) : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {item.isPaid ? (
                        <button
                          onClick={() => handleDeletePayment(item.paymentInfo._id, item.member.name)}
                          className="px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
                        >
                          Batalkan
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenPaymentModal(item)}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg shadow-xs transition-colors flex items-center gap-1.5 ml-auto"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          Bayar Kas
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Bayar Kas & QR Code Pembayaran */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-lg">Catat Pembayaran Kas</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {/* QR Code Section */}
            <div className="mt-4 bg-slate-50 rounded-2xl p-4 border border-slate-200 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                QR Code Pembayaran Kas
              </p>
              {config?.qrCodeImage ? (
                <div className="flex flex-col items-center">
                  <img
                    src={config.qrCodeImage}
                    alt="QRIS Pembayaran Kas"
                    className="w-48 h-48 object-contain rounded-xl border border-slate-200 shadow-xs bg-white p-2"
                  />
                  <p className="text-xs text-slate-600 mt-2 font-medium">{config.qrCodeNote}</p>
                  {config.bankInfo && (
                    <p className="text-xs text-slate-500 mt-1 whitespace-pre-line">{config.bankInfo}</p>
                  )}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <QrCode className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">
                    Belum ada QR Code yang diatur. Anda dapat mengunggahnya di halaman <b>Konfigurasi</b>.
                  </p>
                </div>
              )}
            </div>

            {/* Form Input Detail Pembayaran */}
            <form onSubmit={handleRecordPayment} className="mt-4 space-y-4">
              <div className="bg-indigo-50/60 p-3 rounded-xl text-xs text-indigo-900 border border-indigo-100 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{selectedMember?.name}</p>
                  <p className="text-indigo-700">Angkatan {selectedMember?.batchYear}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-sm text-indigo-900">
                    Bulan {getMonthName(month)} {year}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Nominal Pembayaran (Rp)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-semibold text-sm">
                    Rp
                  </div>
                  <input
                    type="number"
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Catatan / Keterangan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Misal: Transfer BCA a.n Budi / Tunai"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl text-sm font-medium text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Konfirmasi Pembayaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
