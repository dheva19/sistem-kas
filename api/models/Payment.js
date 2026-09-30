const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },
    month: {
      type: Number, // 1 to 12
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Mencegah duplikasi pembayaran untuk anggota di bulan & tahun yang sama
PaymentSchema.index({ memberId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
