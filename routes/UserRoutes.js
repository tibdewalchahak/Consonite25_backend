const express = require('express');
const { submitForm, paymentCallback } = require('../controllers/userController');

const router = express.Router();

// POST /api/users - Submit form
router.post('/', submitForm);

// POST /api/users/payment-callback - Handle payment gateway callback
router.post('/payment-callback', paymentCallback);

module.exports = router;
