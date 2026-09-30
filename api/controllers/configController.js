const AppConfig = require('../models/AppConfig');

// Mendapatkan konfigurasi (Public atau Admin)
exports.getConfig = async (req, res) => {
  try {
    let config = await AppConfig.findOne();
    if (!config) {
      config = await AppConfig.create({
        monthlyDues: 30000,
        qrCodeImage: '',
        qrCodeNote: 'Scan QRIS untuk pembayaran kas atau transfer bank.',
        bankInfo: 'BCA / Mandiri / GoPay / OVO / Dana',
      });
    }
    res.json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mengupdate konfigurasi (Admin Only)
exports.updateConfig = async (req, res) => {
  try {
    const { monthlyDues, qrCodeImage, qrCodeNote, bankInfo } = req.body;

    let config = await AppConfig.findOne();
    if (!config) {
      config = new AppConfig();
    }

    if (monthlyDues !== undefined) config.monthlyDues = Number(monthlyDues);
    if (qrCodeImage !== undefined) config.qrCodeImage = qrCodeImage;
    if (qrCodeNote !== undefined) config.qrCodeNote = qrCodeNote;
    if (bankInfo !== undefined) config.bankInfo = bankInfo;

    await config.save();
    res.json({ success: true, message: 'Konfigurasi berhasil disimpan', data: config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
