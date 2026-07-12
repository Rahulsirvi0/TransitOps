const router = require('express').Router();
const driverController = require('../controllers/driverController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const { body } = require('express-validator');

router.use(auth);
router.get('/', role('admin','fleet_manager','safety_officer'), driverController.list);
router.get('/:id', role('admin','fleet_manager','safety_officer'), driverController.getById);
router.post('/', role('admin','fleet_manager'), [
  body('name').notEmpty(),
  body('license_number').notEmpty(),
  body('license_expiry').isDate()
], driverController.create);
router.put('/:id', role('admin','fleet_manager'), driverController.update);
router.delete('/:id', role('admin'), driverController.delete);

module.exports = router;