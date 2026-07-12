const router = require('express').Router();
const maintenanceController = require('../controllers/maintenanceController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const { body } = require('express-validator');

router.use(auth);
router.get('/', role('admin','fleet_manager','safety_officer'), maintenanceController.list);
router.get('/:id', role('admin','fleet_manager','safety_officer'), maintenanceController.getById);
router.post('/', role('admin','fleet_manager'), [
  body('vehicle_id').isInt(),
  body('maintenance_type').notEmpty(),
  body('maintenance_date').isDate(),
  body('cost').isFloat({min:0})
], maintenanceController.create);
router.put('/:id', role('admin','fleet_manager'), maintenanceController.update);
router.patch('/:id/status', role('admin','fleet_manager'), maintenanceController.updateStatus);
router.delete('/:id', role('admin'), maintenanceController.delete);

module.exports = router;