const Payment = require('../models/Payment');
const Expense = require('../models/Expense');
const Member = require('../models/Member');
const AppConfig = require('../models/AppConfig');

exports.getSummary = async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Total Semua Pemasukan Kas
    const paymentAgg = await Payment.aggregate([
      { $group: { _id: null, totalIncome: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);
    const totalIncome = paymentAgg.length > 0 ? paymentAgg[0].totalIncome : 0;

    // Total Semua Pengeluaran Kas
    const expenseAgg = await Expense.aggregate([
      { $group: { _id: null, totalExpense: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);
    const totalExpense = expenseAgg.length > 0 ? expenseAgg[0].totalExpense : 0;

    // Saldo Bersih Saat Ini
    const balance = totalIncome - totalExpense;

    // Pemasukan Bulan Ini
    const monthPaymentAgg = await Payment.aggregate([
      { $match: { month: currentMonth, year: currentYear } },
      { $group: { _id: null, totalMonthIncome: { $sum: '$amount' }, paidMembersCount: { $sum: 1 } } },
    ]);
    const thisMonthIncome = monthPaymentAgg.length > 0 ? monthPaymentAgg[0].totalMonthIncome : 0;
    const paidMembersThisMonth = monthPaymentAgg.length > 0 ? monthPaymentAgg[0].paidMembersCount : 0;

    // Pengeluaran Bulan Ini
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);
    const monthExpenseAgg = await Expense.aggregate([
      { $match: { date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, totalMonthExpense: { $sum: '$amount' } } },
    ]);
    const thisMonthExpense = monthExpenseAgg.length > 0 ? monthExpenseAgg[0].totalMonthExpense : 0;

    // Total Anggota Aktif
    const totalActiveMembers = await Member.countDocuments({ status: 'active' });

    // Konfigurasi Kas
    const config = await AppConfig.findOne();
    const monthlyDues = config ? config.monthlyDues : 30000;

    // 5 Transaksi Pemasukan Terakhir
    const recentPayments = await Payment.find()
      .populate('memberId', 'name batchYear')
      .sort({ paidAt: -1 })
      .limit(5);

    // 5 Transaksi Pengeluaran Terakhir
    const recentExpenses = await Expense.find().sort({ date: -1 }).limit(5);

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        balance,
        thisMonthIncome,
        thisMonthExpense,
        currentMonth,
        currentYear,
        totalActiveMembers,
        paidMembersThisMonth,
        unpaidMembersThisMonth: Math.max(0, totalActiveMembers - paidMembersThisMonth),
        monthlyDues,
        recentPayments,
        recentExpenses,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
