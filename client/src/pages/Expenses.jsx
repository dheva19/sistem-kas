import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { formatRupiah, formatDate, exportToExcel, exportToCSV } from '../utils/helpers';
import { Search, X } from 'lucide-react';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Operasional',
    date: new Date().toISOString().slice(0, 10),
    description: '',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/expenses', {
        params: { search },
      });
      if (res.data.success) {
        setExpenses(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load expenses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchExpenses();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleOpenModal = (expense = null) => {
    setFormError('');
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        title: expense.title,
        amount: expense.amount,
        category: expense.category,
        date: new Date(expense.date).toISOString().slice(0, 10),
        description: expense.description || '',
      });
    } else {
      setEditingExpense(null);
      setFormData({
        title: '',
        amount: '',
        category: 'Operasional',
        date: new Date().toISOString().slice(0, 10),
        description: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      if (editingExpense) {
        await api.put(`/expenses/${editingExpense._id}`, formData);
      } else {
        await api.post('/expenses', formData);
      }
      setIsModalOpen(false);
      fetchExpenses();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal menyimpan pengeluaran');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Hapus catatan pengeluaran "${title}"?`)) {
      try {
        await api.delete(`/expenses/${id}`);
        fetchExpenses();
      } catch (err) {
        alert(err.response?.data?.message || 'Gagal menghapus pengeluaran');
      }
    }
  };

  const handleExport = (format) => {
    const exportData = expenses.map((exp, index) => ({
      No: index + 1,
      Keperluan: exp.title,
      Kategori: exp.category,
      Nominal: exp.amount,
      Tanggal: formatDate(exp.date),
      Keterangan: exp.description || '-',
    }));

    if (format === 'excel') {
      exportToExcel(exportData, `Pengeluaran_Kas_${new Date().toISOString().slice(0, 10)}`);
    } else {
      exportToCSV(exportData, `Pengeluaran_Kas_${new Date().toISOString().slice(0, 10)}`);
    }
  };

  const totalExpenseAmount = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Pengeluaran Kas</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Total tercatat: <span className="font-semibold text-neutral-900">{formatRupiah(totalExpenseAmount)}</span>
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
            onClick={() => handleOpenModal()}
            className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-md text-xs font-medium transition-colors"
          >
            + Catat Pengeluaran
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-3 rounded-md border border-neutral-200">
        <div className="relative max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari pengeluaran..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-neutral-300 rounded-md text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-md border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 text-xs font-medium">
                <th className="py-2.5 px-4 w-12 text-center">No</th>
                <th className="py-2.5 px-4">Keperluan</th>
                <th className="py-2.5 px-4">Kategori</th>
                <th className="py-2.5 px-4">Tanggal</th>
                <th className="py-2.5 px-4">Nominal</th>
                <th className="py-2.5 px-4">Keterangan</th>
                <th className="py-2.5 px-4 text-right">Opsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-xs text-neutral-400">
                    Memuat data pengeluaran...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-xs text-neutral-400">
                    Belum ada pengeluaran kas.
                  </td>
                </tr>
              ) : (
                expenses.map((exp, idx) => (
                  <tr key={exp._id} className="hover:bg-neutral-50/50">
                    <td className="py-2.5 px-4 text-center text-neutral-400 text-xs">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-medium text-neutral-900">{exp.title}</td>
                    <td className="py-2.5 px-4 text-neutral-600 text-xs">{exp.category}</td>
                    <td className="py-2.5 px-4 text-neutral-500 text-xs">{formatDate(exp.date)}</td>
                    <td className="py-2.5 px-4 font-medium text-neutral-900">
                      -{formatRupiah(exp.amount)}
                    </td>
                    <td className="py-2.5 px-4 text-neutral-500 text-xs truncate max-w-xs">
                      {exp.description || '-'}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="inline-flex items-center gap-3 text-xs">
                        <button
                          onClick={() => handleOpenModal(exp)}
                          className="text-neutral-600 hover:text-neutral-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(exp._id, exp.title)}
                          className="text-neutral-400 hover:text-neutral-900"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Catat Pengeluaran */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40">
          <div className="bg-white rounded-lg border border-neutral-200 w-full max-w-sm p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h2 className="font-semibold text-neutral-900 text-sm">
                {editingExpense ? 'Edit Pengeluaran' : 'Catat Pengeluaran'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-2.5 rounded bg-neutral-50 border border-neutral-300 text-neutral-700 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Keperluan / Judul
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Pembelian ATK / Konsumsi"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-md text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Nominal (Rp)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="50000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-md text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-md text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
                  >
                    <option value="Operasional">Operasional</option>
                    <option value="Konsumsi">Konsumsi</option>
                    <option value="Kegiatan">Kegiatan</option>
                    <option value="Peralatan">Peralatan</option>
                    <option value="Sosial">Sosial</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-md text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Keterangan</label>
                <textarea
                  rows="2"
                  placeholder="Catatan tambahan..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-md text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
                ></textarea>
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
                  {submitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
