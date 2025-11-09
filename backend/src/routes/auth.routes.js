const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const AuthController = require('../controllers/auth.controller');

const router = express.Router();

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/change-password', authMiddleware, AuthController.changePassword);

module.exports = router;
