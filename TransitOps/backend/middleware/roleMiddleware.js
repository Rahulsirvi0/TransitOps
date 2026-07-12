const { errorResponse } = require('../utils/response');

module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return errorResponse(res, 'Forbidden: insufficient permissions', 403);
    }
    next();
  };
};