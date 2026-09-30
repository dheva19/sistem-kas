import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { formatRupiah, getMonthName, formatDate, exportToExcel, exportToCSV } from '../utils/helpers';
import { Search, X } from 'lucide-react';

export default function Tracking() {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [batchYear, setBatchYear] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [trackingData, setTrackingData] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(30000);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

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

  const handleDeletePayment = async (paymentId, memberName) => {
    if (window.confirm(`Batalkan pembayaran kas "${memberName}" untuk bulan ini?`)) {
      try {
        await api.delete(`/payments/${paymentId}`);
        fetchTracking();
      } catch (err) {
        alert(err.response?.data?.message || 'Gagal membatalkan pembayaran');
      }
    }
  };

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
      Periode: `${getMonthName(month)} ${year}`,
      Status: item.isPaid ? 'Lunas' : 'Belum Bayar',
      Nominal: item.isPaid ? item.paymentInfo.amount : (config?.monthlyDues || 30000),
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

  const years = [currentDate.getFullYear() - 1, currentDate.getFullYear(), currentDate.getFullYear() + 1];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Status Kas Bulanan</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Daftar iuran bulan {getMonthName(month)} {year}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('excel')}
            className="px-3 py-1.5 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 rounded-md text-xs font-medium transition-colors"
          >
            Export Excel
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="px-3 py-1.5 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 rounded-md text-xs font-medium transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Control bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3 rounded-md border border-neutral-200">
        <div>
          <label className="block text-[11px] font-medium text-neutral-600 mb-1">Bulan</label>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-md text-sm text-neutral-800 focus:outline-none focus:border-neutral-900"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {getMonthName(m)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-neutral-600 mb-1">Tahun</label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-md text-sm text-neutral-800 focus:outline-none focus:border-neutral-900"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-neutral-600 mb-1">Status Iuran</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-md text-sm text-neutral-800 focus:outline-none focus:border-neutral-900"
          >
            <option value="all">Semua Anggota</option>
            <option value="paid">Sudah Lunas</option>
            <option value="unpaid">Belum Bayar</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-neutral-600 mb-1">Cari Nama</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-neutral-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-neutral-300 rounded-md text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-900"
            />
          </div>
        </div>
      </div>

      {/* Ringkasan Angka */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-md border border-neutral-200">
          <p className="text-[11px] text-neutral-500 font-medium">Total Anggota</p>
          <p className="text-lg font-semibold text-neutral-900 mt-0.5">{trackingData?.totalMembers || 0}</p>
        </div>
        <div className="bg-white p-3 rounded-md border border-neutral-200">
          <p className="text-[11px] text-neutral-500 font-medium">Sudah Lunas</p>
          <p className="text-lg font-semibold text-neutral-900 mt-0.5">{trackingData?.paidCount || 0}</p>
        </div>
        <div className="bg-white p-3 rounded-md border border-neutral-200">
          <p className="text-[11px] text-neutral-500 font-medium">Belum Bayar</p>
          <p className="text-lg font-semibold text-neutral-900 mt-0.5">{trackingData?.unpaidCount || 0}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-md border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 text-xs font-medium">
                <th className="py-2.5 px-4 w-12 text-center">No</th>
                <th className="py-2.5 px-4">Nama Anggota</th>
                <th className="py-2.5 px-4">Angkatan</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Tanggal Pembayaran</th>
                <th className="py-2.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-xs text-neutral-400">
                    Memuat data kas...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-xs text-neutral-400">
                    Tidak ada data yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredList.map((item, idx) => (
                  <tr key={item.member._id} className="hover:bg-neutral-50/50">
                    <td className="py-2.5 px-4 text-center text-neutral-400 text-xs">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-medium text-neutral-900">{item.member.name}</td>
                    <td className="py-2.5 px-4 text-neutral-600 text-xs">{item.member.batchYear}</td>
                    <td className="py-2.5 px-4 text-xs">
                      {item.isPaid ? (
                        <span className="text-neutral-800 font-medium">
                          Lunas ({formatRupiah(item.paymentInfo.amount)})
                        </span>
                      ) : (
                        <span className="text-neutral-400">Belum Bayar</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-neutral-500 text-xs">
                      {item.isPaid ? formatDate(item.paymentInfo.paidAt) : '-'}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      {item.isPaid ? (
                        <button
                          onClick={() => handleDeletePayment(item.paymentInfo._id, item.member.name)}
                          className="text-xs text-neutral-400 hover:text-neutral-900"
                        >
                          Batalkan
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenPaymentModal(item)}
                          className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded text-xs font-medium"
                        >
                          Bayar
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

      {/* Modal Payment & QR Code */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 overflow-y-auto">
          <div className="bg-white rounded-lg border border-neutral-200 w-full max-w-sm p-5 shadow-lg my-8">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h2 className="font-semibold text-neutral-900 text-sm">Pembayaran Kas</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="mt-3 p-2.5 rounded bg-neutral-50 border border-neutral-300 text-neutral-700 text-xs">
                {modalError}
              </div>
            )}

            {/* QR Code */}
            {config?.qrCodeImage ? (
              <div className="mt-4 p-3 bg-neutral-50 border border-neutral-200 rounded-md text-center">
                <p className="text-xs font-medium text-neutral-700 mb-2">QR Code Pembayaran</p>
                <img
                  src={config.qrCodeImage}
                  alt="QR Code"
                  className="w-36 h-36 object-contain mx-auto bg-white p-1 border border-neutral-200 rounded"
                />
                <p className="text-[11px] text-neutral-500 mt-2">{config.qrCodeNote}</p>
                {config.bankInfo && (
                  <p className="text-[11px] text-neutral-600 mt-1">{config.bankInfo}</p>
                )}
              </div>
            ) : null}

            <form onSubmit={handleRecordPayment} className="mt-4 space-y-3">
              <div className="p-2.5 bg-neutral-50 rounded border border-neutral-200 text-xs">
                <span className="font-medium text-neutral-900">{selectedMember?.name}</span>
                <span className="text-neutral-500"> • Bulan {getMonthName(month)} {year}</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Nominal (Rp)
                </label>
                <input
                  type="number"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-md text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Catatan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Misal: Tunai / Transfer"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-md text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 border border-neutral-300 hover:bg-neutral-50 rounded-md text-xs font-medium text-neutral-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-md text-xs font-medium disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Pembayaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
