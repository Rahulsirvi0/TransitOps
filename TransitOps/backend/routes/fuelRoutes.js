const router = require('express').Router();
const fuelController = require('../controllers/fuelController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const { body } = require('express-validator');

router.use(auth);
router.get('/', role('admin','fleet_manager','driver','financial_analyst'), fuelController.list);
router.get('/:id', role('admin','fleet_manager','driver','financial_analyst'), fuelController.getById);
router.post('/', role('admin','fleet_manager','driver'), [
  body('vehicle_id').isInt(),
  body('fuel_liters').isFloat({min:0}),
  body('fuel_cost').isFloat({min:0}),
  body('log_date').isDate()
], fuelController.create);
router.put('/:id', role('admin','fleet_manager'), fuelController.update);
router.delete('/:id', role('admin'), fuelController.delete);

module.exports = router;