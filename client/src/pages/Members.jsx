import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { exportToExcel, exportToCSV, formatDate } from '../utils/helpers';
import { Search, X } from 'lucide-react';

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    batchYear: new Date().getFullYear(),
    status: 'active',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedBatch) params.batchYear = selectedBatch;

      const res = await api.get('/members', { params });
      if (res.data.success) {
        setMembers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load members', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchMembers();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, selectedBatch]);

  const handleOpenModal = (member = null) => {
    setFormError('');
    if (member) {
      setEditingMember(member);
      setFormData({
        name: member.name,
        batchYear: member.batchYear,
        status: member.status,
      });
    } else {
      setEditingMember(null);
      setFormData({
        name: '',
        batchYear: new Date().getFullYear(),
        status: 'active',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      if (editingMember) {
        await api.put(`/members/${editingMember._id}`, formData);
      } else {
        await api.post('/members', formData);
      }
      setIsModalOpen(false);
      fetchMembers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal menyimpan data anggota');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Hapus anggota "${name}" beserta data kasnya?`)) {
      try {
        await api.delete(`/members/${id}`);
        fetchMembers();
      } catch (err) {
        alert(err.response?.data?.message || 'Gagal menghapus anggota');
      }
    }
  };

  const handleExport = (format) => {
    const exportData = members.map((m, index) => ({
      No: index + 1,
      Nama: m.name,
      Angkatan: m.batchYear,
      Status: m.status === 'active' ? 'Aktif' : 'Nonaktif',
      'Terdaftar Pada': formatDate(m.createdAt),
    }));

    if (format === 'excel') {
      exportToExcel(exportData, `Daftar_Anggota_${new Date().toISOString().slice(0, 10)}`);
    } else {
      exportToCSV(exportData, `Daftar_Anggota_${new Date().toISOString().slice(0, 10)}`);
    }
  };

  const batches = [...new Set(members.map((m) => m.batchYear))].sort((a, b) => b - a);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Data Anggota</h1>
          <p className="text-xs text-neutral-500 mt-0.5">Daftar nama dan tahun angkatan</p>
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
            + Tambah Anggota
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white p-3 rounded-md border border-neutral-200">
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-neutral-300 rounded-md text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 bg-white border border-neutral-300 rounded-md text-sm text-neutral-700 focus:outline-none focus:border-neutral-900"
          >
            <option value="">Semua Angkatan</option>
            {batches.map((b) => (
              <option key={b} value={b}>
                Angkatan {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-md border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 text-xs font-medium">
                <th className="py-2.5 px-4 w-12 text-center">No</th>
                <th className="py-2.5 px-4">Nama Lengkap</th>
                <th className="py-2.5 px-4">Angkatan</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Opsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-xs text-neutral-400">
                    Memuat data anggota...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-xs text-neutral-400">
                    Tidak ada anggota ditemukan.
                  </td>
                </tr>
              ) : (
                members.map((m, idx) => (
                  <tr key={m._id} className="hover:bg-neutral-50/50">
                    <td className="py-2.5 px-4 text-center text-neutral-400 text-xs">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-medium text-neutral-900">{m.name}</td>
                    <td className="py-2.5 px-4 text-neutral-600 text-xs">{m.batchYear}</td>
                    <td className="py-2.5 px-4 text-xs">
                      {m.status === 'active' ? (
                        <span className="text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                          Aktif
                        </span>
                      ) : (
                        <span className="text-neutral-400 bg-neutral-50 px-2 py-0.5 rounded">Nonaktif</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="inline-flex items-center gap-3 text-xs">
                        <button
                          onClick={() => handleOpenModal(m)}
                          className="text-neutral-600 hover:text-neutral-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(m._id, m.name)}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40">
          <div className="bg-white rounded-lg border border-neutral-200 w-full max-w-sm p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h2 className="font-semibold text-neutral-900 text-sm">
                {editingMember ? 'Edit Anggota' : 'Tambah Anggota'}
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
                  Nama Anggota
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama lengkap"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-md text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Angkatan (Tahun)
                </label>
                <input
                  type="number"
                  required
                  min="1990"
                  max="2099"
                  placeholder="2024"
                  value={formData.batchYear}
                  onChange={(e) => setFormData({ ...formData, batchYear: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-md text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-md text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
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
