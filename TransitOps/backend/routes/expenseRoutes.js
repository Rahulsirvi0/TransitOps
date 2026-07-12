const router = require('express').Router();
const expenseController = require('../controllers/expenseController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const { body } = require('express-validator');

router.use(auth);
router.get('/', role('admin','fleet_manager','financial_analyst'), expenseController.list);
router.get('/:id', role('admin','fleet_manager','financial_analyst'), expenseController.getById);
router.post('/', role('admin','fleet_manager'), [
  body('expense_type').isIn(['Fuel','Repair','Toll','Insurance','Miscellaneous']),
  body('cost').isFloat({min:0}),
  body('expense_date').isDate()
], expenseController.create);
router.put('/:id', role('admin','fleet_manager'), expenseController.update);
router.delete('/:id', role('admin'), expenseController.delete);

module.exports = router;