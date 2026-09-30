const Member = require('../models/Member');
const Payment = require('../models/Payment');

exports.getMembers = async (req, res) => {
  try {
    const { search, batchYear, status } = req.query;
    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (batchYear) {
      query.batchYear = Number(batchYear);
    }
    if (status) {
      query.status = status;
    }

    const members = await Member.find(query).sort({ batchYear: -1, name: 1 });
    res.json({ success: true, data: members });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMemberById = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Anggota tidak ditemukan' });
    }
    res.json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createMember = async (req, res) => {
  try {
    const { name, batchYear, status } = req.body;
    if (!name || !batchYear) {
      return res.status(400).json({ success: false, message: 'Nama dan Angkatan tahun wajib diisi' });
    }

    const member = new Member({
      name: name.trim(),
      batchYear: Number(batchYear),
      status: status || 'active',
    });

    await member.save();
    res.status(201).json({ success: true, message: 'Anggota berhasil ditambahkan', data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateMember = async (req, res) => {
  try {
    const { name, batchYear, status } = req.body;
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({ success: false, message: 'Anggota tidak ditemukan' });
    }

    if (name) member.name = name.trim();
    if (batchYear) member.batchYear = Number(batchYear);
    if (status) member.status = status;

    await member.save();
    res.json({ success: true, message: 'Data anggota berhasil diupdate', data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Anggota tidak ditemukan' });
    }

    // Hapus histori pembayaran anggota juga jika diperlukan
    await Payment.deleteMany({ memberId: member._id });
    await Member.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Anggota dan riwayat pembayarannya berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
