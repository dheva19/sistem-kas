import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { formatRupiah, formatDate, exportToExcel, exportToCSV } from '../utils/helpers';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/summary');
      if (res.data.success) {
        setSummary(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleExportSummary = (format) => {
    if (!summary) return;

    const exportData = [
      { Indikator: 'Total Saldo Kas', Nilai: summary.balance },
      { Indikator: 'Total Semua Pemasukan', Nilai: summary.totalIncome },
      { Indikator: 'Total Semua Pengeluaran', Nilai: summary.totalExpense },
      { Indikator: 'Pemasukan Kas Bulan Ini', Nilai: summary.thisMonthIncome },
      { Indikator: 'Pengeluaran Kas Bulan Ini', Nilai: summary.thisMonthExpense },
      { Indikator: 'Total Anggota Aktif', Nilai: summary.totalActiveMembers },
      { Indikator: 'Anggota Lunas Bulan Ini', Nilai: summary.paidMembersThisMonth },
      { Indikator: 'Anggota Belum Lunas', Nilai: summary.unpaidMembersThisMonth },
      { Indikator: 'Nominal Kas Bulanan', Nilai: summary.monthlyDues },
    ];

    if (format === 'excel') {
      exportToExcel(exportData, `Laporan_Kas_${new Date().toISOString().slice(0, 10)}`);
    } else {
      exportToCSV(exportData, `Laporan_Kas_${new Date().toISOString().slice(0, 10)}`);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-neutral-500">
        Memuat data ringkasan...
      </div>
    );
  }

  const complianceRate =
    summary?.totalActiveMembers > 0
      ? Math.round((summary.paidMembersThisMonth / summary.totalActiveMembers) * 100)
      : 0;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Dashboard</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Periode: Bulan {summary?.currentMonth} / {summary?.currentYear}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExportSummary('excel')}
            className="px-3 py-1.5 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 rounded-md text-xs font-medium transition-colors"
          >
            Export Excel
          </button>
          <button
            onClick={() => handleExportSummary('csv')}
            className="px-3 py-1.5 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 rounded-md text-xs font-medium transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-md border border-neutral-200">
          <p className="text-xs text-neutral-500 font-medium">Saldo Kas Saat Ini</p>
          <p className="text-xl font-semibold text-neutral-900 mt-1">{formatRupiah(summary?.balance)}</p>
          <p className="text-[11px] text-neutral-400 mt-2">Total kas bersih tersisa</p>
        </div>

        <div className="bg-white p-4 rounded-md border border-neutral-200">
          <p className="text-xs text-neutral-500 font-medium">Pemasukan Bulan Ini</p>
          <p className="text-xl font-semibold text-neutral-900 mt-1">{formatRupiah(summary?.thisMonthIncome)}</p>
          <p className="text-[11px] text-neutral-400 mt-2">
            Total akumulasi: {formatRupiah(summary?.totalIncome)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-md border border-neutral-200">
          <p className="text-xs text-neutral-500 font-medium">Pengeluaran Bulan Ini</p>
          <p className="text-xl font-semibold text-neutral-900 mt-1">{formatRupiah(summary?.thisMonthExpense)}</p>
          <p className="text-[11px] text-neutral-400 mt-2">
            Total terpakai: {formatRupiah(summary?.totalExpense)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-md border border-neutral-200">
          <p className="text-xs text-neutral-500 font-medium">Kepatuhan Iuran Bulan Ini</p>
          <p className="text-xl font-semibold text-neutral-900 mt-1">
            {summary?.paidMembersThisMonth} / {summary?.totalActiveMembers} Orang
          </p>
          <div className="w-full bg-neutral-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div
              className="bg-neutral-800 h-1.5 rounded-full"
              style={{ width: `${complianceRate}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1.5">{complianceRate}% anggota sudah membayar</p>
        </div>
      </div>

      {/* Info Bar */}
      <div className="bg-white border border-neutral-200 p-4 rounded-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
        <div>
          <span className="font-medium text-neutral-900">Tarif Iuran: </span>
          <span className="text-neutral-700">{formatRupiah(summary?.monthlyDues)} / bulan per anggota</span>
        </div>
        <div className="flex gap-2 text-xs">
          <Link
            to="/tracking"
            className="px-3 py-1.5 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors"
          >
            Lihat Status Kas
          </Link>
          <Link
            to="/config"
            className="px-3 py-1.5 bg-white border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 transition-colors"
          >
            Atur QR & Nominal
          </Link>
        </div>
      </div>

      {/* Recent Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pemasukan Terkini */}
        <div className="bg-white rounded-md border border-neutral-200 p-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Pemasukan Kas Terakhir
            </h2>
            <Link to="/tracking" className="text-xs text-neutral-600 hover:text-neutral-900 underline">
              Semua
            </Link>
          </div>

          <div className="divide-y divide-neutral-100 text-sm">
            {summary?.recentPayments?.length > 0 ? (
              summary.recentPayments.map((p) => (
                <div key={p._id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-neutral-900">{p.memberId?.name || 'Anggota'}</p>
                    <p className="text-xs text-neutral-400">
                      Bulan {p.month}/{p.year} • {formatDate(p.paidAt)}
                    </p>
                  </div>
                  <span className="font-medium text-neutral-900">{formatRupiah(p.amount)}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-neutral-400 py-4 text-center">Belum ada data pembayaran.</p>
            )}
          </div>
        </div>

        {/* Pengeluaran Terkini */}
        <div className="bg-white rounded-md border border-neutral-200 p-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Pengeluaran Terakhir
            </h2>
            <Link to="/expenses" className="text-xs text-neutral-600 hover:text-neutral-900 underline">
              Semua
            </Link>
          </div>

          <div className="divide-y divide-neutral-100 text-sm">
            {summary?.recentExpenses?.length > 0 ? (
              summary.recentExpenses.map((exp) => (
                <div key={exp._id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-neutral-900">{exp.title}</p>
                    <p className="text-xs text-neutral-400">
                      {exp.category} • {formatDate(exp.date)}
                    </p>
                  </div>
                  <span className="font-medium text-neutral-900">-{formatRupiah(exp.amount)}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-neutral-400 py-4 text-center">Belum ada data pengeluaran.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
