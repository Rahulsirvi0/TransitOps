const router = require('express').Router();
const tripController = require('../controllers/tripController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const { body } = require('express-validator');

router.use(auth);
router.get('/', role('admin','fleet_manager','driver','safety_officer','financial_analyst'), tripController.list);
router.get('/:id', role('admin','fleet_manager','driver','safety_officer','financial_analyst'), tripController.getById);
router.post('/', role('admin','fleet_manager'), [
  body('trip_number').notEmpty(),
  body('source').notEmpty(),
  body('destination').notEmpty(),
  body('vehicle_id').isInt(),
  body('driver_id').isInt(),
  body('cargo_weight').isFloat({min:0})
], tripController.create);
router.put('/:id', role('admin','fleet_manager'), tripController.update);
router.delete('/:id', role('admin','fleet_manager'), tripController.delete);
router.post('/:id/dispatch', role('admin','fleet_manager'), tripController.dispatch);
router.post('/:id/complete', role('admin','fleet_manager'), [
  body('actual_distance').isFloat({min:0}),
  body('revenue').isFloat({min:0})
], tripController.complete);
router.post('/:id/cancel', role('admin','fleet_manager'), tripController.cancel);

module.exports = router;