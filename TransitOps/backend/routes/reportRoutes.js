const router = require('express').Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
router.use(auth);

router.get('/trip-summary', role('admin','fleet_manager','financial_analyst'), reportController.tripSummary);
router.get('/expense-summary', role('admin','fleet_manager','financial_analyst'), reportController.expenseSummary);
router.get('/fleet-utilization', role('admin','fleet_manager','financial_analyst'), reportController.fleetUtilization);
router.get('/fuel-efficiency', role('admin','fleet_manager','financial_analyst'), reportController.fuelEfficiency);
router.get('/vehicle-roi', role('admin','fleet_manager','financial_analyst'), reportController.vehicleROI);
router.get('/maintenance-cost', role('admin','fleet_manager','safety_officer','financial_analyst'), reportController.maintenanceCost);

module.exports = router;