const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const authController = require('../controllers/authController');
const memberController = require('../controllers/memberController');
const paymentController = require('../controllers/paymentController');
const expenseController = require('../controllers/expenseController');
const configController = require('../controllers/configController');
const dashboardController = require('../controllers/dashboardController');

// --- Auth Routes ---
router.post('/auth/login', authController.login);
router.get('/auth/me', auth, authController.getMe);
router.put('/auth/profile', auth, authController.updateProfile);

// --- Config Routes (Public read, Protected update) ---
router.get('/config', configController.getConfig);
router.put('/config', auth, configController.updateConfig);

// --- Dashboard Routes (Protected) ---
router.get('/dashboard/summary', auth, dashboardController.getSummary);

// --- Member Routes (Protected) ---
router.get('/members', auth, memberController.getMembers);
router.get('/members/:id', auth, memberController.getMemberById);
router.post('/members', auth, memberController.createMember);
router.put('/members/:id', auth, memberController.updateMember);
router.delete('/members/:id', auth, memberController.deleteMember);

// --- Payment & Tracking Routes (Protected) ---
router.get('/payments/tracking', auth, paymentController.getMonthlyTracking);
router.get('/payments', auth, paymentController.getPayments);
router.post('/payments', auth, paymentController.createPayment);
router.delete('/payments/:id', auth, paymentController.deletePayment);

// --- Expense Routes (Protected) ---
router.get('/expenses', auth, expenseController.getExpenses);
router.post('/expenses', auth, expenseController.createExpense);
router.put('/expenses/:id', auth, expenseController.updateExpense);
router.delete('/expenses/:id', auth, expenseController.deleteExpense);

module.exports = router;
