const Expense = require('../models/Expense');

exports.getExpenses = async (req, res) => {
  try {
    const { month, year, search } = req.query;
    let query = {};

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const expenses = await Expense.find(query).sort({ date: -1 });
    res.json({ success: true, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createExpense = async (req, res) => {
  try {
    const { title, amount, date, category, description } = req.body;

    if (!title || !amount) {
      return res.status(400).json({ success: false, message: 'Judul pengeluaran dan jumlah nominal wajib diisi' });
    }

    const expense = new Expense({
      title: title.trim(),
      amount: Number(amount),
      date: date ? new Date(date) : new Date(),
      category: category || 'Operasional',
      description: description || '',
    });

    await expense.save();
    res.status(201).json({ success: true, message: 'Pengeluaran kas berhasil dicatat', data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const { title, amount, date, category, description } = req.body;
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Pengeluaran tidak ditemukan' });
    }

    if (title) expense.title = title.trim();
    if (amount !== undefined) expense.amount = Number(amount);
    if (date) expense.date = new Date(date);
    if (category) expense.category = category;
    if (description !== undefined) expense.description = description;

    await expense.save();
    res.json({ success: true, message: 'Pengeluaran berhasil diperbarui', data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Pengeluaran tidak ditemukan' });
    }

    await Expense.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Pengeluaran kas berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
