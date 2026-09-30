const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username dan password wajib diisi.' });
    }

    // Cek jika belum ada admin sama sekali di database, buat admin default
    const count = await Admin.countDocuments();
    if (count === 0) {
      const defaultAdmin = new Admin({
        username: 'admin',
        password: 'admin123',
        name: 'Administrator Kas',
      });
      await defaultAdmin.save();
    }

    const admin = await Admin.findOne({ username: username.toLowerCase().trim() });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Username atau password salah.' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Username atau password salah.' });
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username, name: admin.name },
      process.env.JWT_SECRET || 'kas_secret_key_123456',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login berhasil',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        name: admin.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server', error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin tidak ditemukan' });
    }
    res.json({ success: true, admin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.admin.id);

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin tidak ditemukan' });
    }

    if (name) admin.name = name;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Password saat ini harus diisi untuk ganti password' });
      }
      const isMatch = await admin.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Password saat ini salah' });
      }
      admin.password = newPassword;
    }

    await admin.save();

    res.json({
      success: true,
      message: 'Profil berhasil diperbarui',
      admin: { id: admin._id, username: admin.username, name: admin.name },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
