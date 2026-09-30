import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { formatRupiah, formatDate, exportToExcel, exportToCSV } from '../utils/helpers';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
} from 'lucide-react';
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
      exportToExcel(exportData, `Ringkasan_Kas_${new Date().toISOString().slice(0, 10)}`);
    } else {
      exportToCSV(exportData, `Ringkasan_Kas_${new Date().toISOString().slice(0, 10)}`);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const complianceRate =
    summary?.totalActiveMembers > 0
      ? Math.round((summary.paidMembersThisMonth / summary.totalActiveMembers) * 100)
      : 0;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Dashboard Kas</h1>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            Periode: Bulan {summary?.currentMonth} - {summary?.currentYear}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExportSummary('excel')}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
          <button
            onClick={() => handleExportSummary('csv')}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-medium transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Saldo Kas */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Saldo Kas Bersih</span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatRupiah(summary?.balance)}</div>
          <p className="text-xs text-slate-500 mt-2">Total kas terkumpul saat ini</p>
        </div>

        {/* Card 2: Pemasukan Bulan Ini */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Masuk Bulan Ini</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600">{formatRupiah(summary?.thisMonthIncome)}</div>
          <p className="text-xs text-slate-500 mt-2">
            Dari total: <span className="font-medium text-slate-700">{formatRupiah(summary?.totalIncome)}</span>
          </p>
        </div>

        {/* Card 3: Pengeluaran Bulan Ini */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Keluar Bulan Ini</span>
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600">{formatRupiah(summary?.thisMonthExpense)}</div>
          <p className="text-xs text-slate-500 mt-2">
            Dari total: <span className="font-medium text-slate-700">{formatRupiah(summary?.totalExpense)}</span>
          </p>
        </div>

        {/* Card 4: Kepatuhan Iuran */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Iuran Bulan Ini</span>
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {summary?.paidMembersThisMonth} / {summary?.totalActiveMembers}
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all"
              style={{ width: `${complianceRate}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-500 mt-2">{complianceRate}% anggota telah membayar</p>
        </div>
      </div>

      {/* Quick Action Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Iuran Kas: {formatRupiah(summary?.monthlyDues)} / bulan</h2>
          <p className="text-indigo-200 text-sm mt-1">
            Pantau anggota yang belum membayar bulan ini dan bagikan QRIS pembayaran secara mudah.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/tracking"
            className="px-4 py-2.5 bg-white text-indigo-900 font-semibold text-sm rounded-xl hover:bg-indigo-50 transition-colors shadow-xs"
          >
            Lihat Status Kas Bulanan
          </Link>
          <Link
            to="/config"
            className="px-4 py-2.5 bg-indigo-800/80 hover:bg-indigo-800 text-white font-semibold text-sm rounded-xl transition-colors border border-indigo-600/40"
          >
            Ubah QR & Nominal
          </Link>
        </div>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pemasukan Terkini */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-emerald-600" />
              Pemasukan Kas Terakhir
            </h3>
            <Link to="/tracking" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
              Lihat Semua
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {summary?.recentPayments?.length > 0 ? (
              summary.recentPayments.map((p) => (
                <div key={p._id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                      {p.memberId?.name ? p.memberId.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-slate-800">{p.memberId?.name || 'Anggota'}</p>
                      <p className="text-xs text-slate-400">
                        Bulan {p.month}/{p.year} • {formatDate(p.paidAt)}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-emerald-600 text-sm">{formatRupiah(p.amount)}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 py-4 text-center">Belum ada catatan pembayaran kas.</p>
            )}
          </div>
        </div>

        {/* Pengeluaran Terkini */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <ArrowDownRight className="w-5 h-5 text-rose-600" />
              Pengeluaran Terakhir
            </h3>
            <Link to="/expenses" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
              Lihat Semua
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {summary?.recentExpenses?.length > 0 ? (
              summary.recentExpenses.map((exp) => (
                <div key={exp._id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-slate-800">{exp.title}</p>
                    <p className="text-xs text-slate-400">
                      {exp.category} • {formatDate(exp.date)}
                    </p>
                  </div>
                  <span className="font-semibold text-rose-600 text-sm">-{formatRupiah(exp.amount)}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 py-4 text-center">Belum ada catatan pengeluaran kas.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
