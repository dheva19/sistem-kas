const Payment = require('../models/Payment');
const Member = require('../models/Member');
const AppConfig = require('../models/AppConfig');

// Mendapatkan status kas bulanan seluruh anggota (Tracking: siapa yang sudah bayar & belum bayar)
exports.getMonthlyTracking = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const month = req.query.month ? Number(req.query.month) : currentMonth;
    const year = req.query.year ? Number(req.query.year) : currentYear;
    const batchYear = req.query.batchYear ? Number(req.query.batchYear) : null;

    // Ambil anggota
    let memberQuery = { status: 'active' };
    if (batchYear) {
      memberQuery.batchYear = batchYear;
    }

    const members = await Member.find(memberQuery).sort({ batchYear: -1, name: 1 });

    // Ambil pembayaran untuk bulan & tahun yang dimaksud
    const payments = await Payment.find({ month, year });
    const paidMemberMap = new Map();
    payments.forEach((p) => {
      paidMemberMap.set(p.memberId.toString(), p);
    });

    // Format list tracking
    const trackingList = members.map((m) => {
      const payment = paidMemberMap.get(m._id.toString());
      return {
        member: m,
        isPaid: !!payment,
        paymentInfo: payment || null,
      };
    });

    const totalMembers = members.length;
    const paidCount = trackingList.filter((item) => item.isPaid).length;
    const unpaidCount = totalMembers - paidCount;

    res.json({
      success: true,
      data: {
        month,
        year,
        totalMembers,
        paidCount,
        unpaidCount,
        trackingList,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Riwayat list pembayaran dengan filter
exports.getPayments = async (req, res) => {
  try {
    const { month, year, memberId } = req.query;
    let query = {};

    if (month) query.month = Number(month);
    if (year) query.year = Number(year);
    if (memberId) query.memberId = memberId;

    const payments = await Payment.find(query)
      .populate('memberId', 'name batchYear status')
      .sort({ paidAt: -1 });

    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Catat pembayaran kas baru
exports.createPayment = async (req, res) => {
  try {
    const { memberId, month, year, amount, notes, paidAt } = req.body;

    if (!memberId || !month || !year) {
      return res.status(400).json({ success: false, message: 'Member, bulan, dan tahun wajib ditentukan' });
    }

    // Ambil default config amount jika tidak diisi
    let finalAmount = amount;
    if (!finalAmount) {
      const config = await AppConfig.findOne();
      finalAmount = config ? config.monthlyDues : 30000;
    }

    // Cek apakah sudah pernah bayar di periode ini
    const existing = await Payment.findOne({ memberId, month: Number(month), year: Number(year) });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Anggota ini sudah tercatat membayar kas pada bulan dan tahun tersebut.',
      });
    }

    const payment = new Payment({
      memberId,
      month: Number(month),
      year: Number(year),
      amount: Number(finalAmount),
      notes: notes || '',
      paidAt: paidAt ? new Date(paidAt) : new Date(),
    });

    await payment.save();
    const populated = await Payment.findById(payment._id).populate('memberId', 'name batchYear');

    res.status(201).json({
      success: true,
      message: 'Pembayaran kas berhasil dicatat',
      data: populated,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Anggota sudah membayar kas di periode ini' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// Hapus pembayaran
exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Data pembayaran tidak ditemukan' });
    }

    await Payment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Data pembayaran berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
