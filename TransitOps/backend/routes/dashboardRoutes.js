const router = require('express').Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

router.use(auth);
router.get('/kpis', role('admin','fleet_manager','safety_officer','financial_analyst'), dashboardController.getKPIs);
router.get('/charts', role('admin','fleet_manager','safety_officer','financial_analyst'), dashboardController.getCharts);

module.exports = router;