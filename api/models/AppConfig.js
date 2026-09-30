const mongoose = require('mongoose');

const AppConfigSchema = new mongoose.Schema(
  {
    monthlyDues: {
      type: Number,
      default: 30000,
    },
    qrCodeImage: {
      type: String, // Base64 data URL or image string
      default: '',
    },
    qrCodeNote: {
      type: String,
      default: 'Scan QRIS untuk pembayaran kas atau transfer bank.',
    },
    bankInfo: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.AppConfig || mongoose.model('AppConfig', AppConfigSchema);
