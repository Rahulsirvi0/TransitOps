const jwt = require('jsonwebtoken');
const users = require('../data/users');
const { jwtSecret, jwtRefreshSecret, jwtExpire, jwtRefreshExpire } = require('../config/auth');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/response');

const generateTokens = (user) => {
  const accessToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, jwtSecret, { expiresIn: jwtExpire });
  const refreshToken = jwt.sign({ id: user.id }, jwtRefreshSecret, { expiresIn: jwtRefreshExpire });
  return { accessToken, refreshToken };
};

const publicUser = (user) => ({
  id: user.id,
  email: user.email,
  full_name: user.full_name,
  role: user.role,
  status: user.status,
});

const findUserByEmail = (email) => users.find((user) => user.email.toLowerCase() === String(email || '').trim().toLowerCase());

const findUserById = (id) => users.find((user) => String(user.id) === String(id));

const getUserForSession = (id) => {
  const user = findUserById(id);
  return user ? publicUser(user) : null;
};

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError('Email and password required', 400);
  const user = findUserByEmail(email);
  if (!user || user.status !== 'active' || user.password !== password) throw new AppError('Invalid credentials', 401);
  const tokens = generateTokens(user);
  successResponse(res, { user: publicUser(user), ...tokens }, 'Login successful');
});

exports.refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new AppError('Refresh token required', 400);
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, jwtRefreshSecret);
  } catch {
    throw new AppError('Invalid token', 401);
  }

  const user = findUserById(decoded.id);
  if (!user || user.status !== 'active') throw new AppError('User not found', 401);
  const tokens = generateTokens(user);
  successResponse(res, tokens);
});

exports.me = catchAsync(async (req, res) => {
  const user = getUserForSession(req.user.id);
  if (!user) throw new AppError('User not found', 404);
  successResponse(res, user);
});

exports.logout = catchAsync(async (req, res) => {
  successResponse(res, null, 'Logged out');
});

exports.forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const user = findUserByEmail(email);
  if (!user) {
    successResponse(res, null, 'If email exists, reset link sent.');
    return;
  }
  successResponse(res, null, 'If email exists, reset link sent.');
});