const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/response');

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msg = errors.array().map(e => e.msg).join(', ');
    return errorResponse(res, msg, 400);
  }
  next();
};