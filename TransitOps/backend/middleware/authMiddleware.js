const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/auth');
const { errorResponse } = require('../utils/response');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Access denied. No token provided.', 401);
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (ex) {
    return errorResponse(res, 'Invalid token.', 401);
  }
};