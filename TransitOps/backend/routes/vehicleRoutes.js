const router = require('express').Router();
const vehicleController = require('../controllers/vehicleController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const { body } = require('express-validator');

router.use(auth);
router.get('/', role('admin','fleet_manager','safety_officer','financial_analyst'), vehicleController.list);
router.get('/:id', role('admin','fleet_manager','safety_officer','financial_analyst'), vehicleController.getById);
router.post('/', role('admin','fleet_manager'), [
  body('registration_number').notEmpty().withMessage('Registration number required'),
  body('vehicle_type').isIn(['Truck','Van','Bus','Trailer','Pickup']).withMessage('Invalid type'),
  body('max_load_capacity').isFloat({min:0}).withMessage('Capacity must be positive'),
], vehicleController.create);
router.put('/:id', role('admin','fleet_manager'), vehicleController.update);
router.delete('/:id', role('admin'), vehicleController.delete);
module.exports = router;