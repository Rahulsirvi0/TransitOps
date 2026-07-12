const router = require('express').Router();
const authController = require('../controllers/authController');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required')
], validate, authController.login);
router.get('/me', authMiddleware, authController.me);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/forgot-password', [body('email').isEmail().withMessage('Valid email required')], validate, authController.forgotPassword);

module.exports = router;