import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import License from '../models/License.js';
import { AppError } from '../utils/AppError.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('Not authorized. Please login.', 401));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('+password');
    if (!user) return next(new AppError('User no longer exists.', 401));
    if (!user.isActive) return next(new AppError('Account is deactivated.', 401));
    req.user = user;
    next();
  } catch (err) {
    return next(new AppError('Invalid or expired token.', 401));
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to perform this action.', 403));
  }
  next();
};

export const checkLicense = async (req, res, next) => {
  if (req.user.role === 'super_admin') return next();
  const clientId = req.user.role === 'company' ? req.user.companyId : req.user._id;
  const clientModel = req.user.role === 'company' ? 'Company' : 'User';
  if (!clientId) return next(new AppError('No company or client associated.', 403));
  const license = await License.findOne({ clientId, clientModel, status: 'active' })
    .sort({ expiryDate: -1 })
    .limit(1);
  if (!license) return next(new AppError('No active license found. Contact admin.', 403));
  if (new Date(license.expiryDate) < new Date()) {
    license.status = 'expired';
    await license.save();
    return next(new AppError('License has expired. Contact admin.', 403));
  }
  if (license.type === 'limited' && license.maxUsers != null) {
    const userCount = await User.countDocuments({
      $or: [{ companyId: clientId }, { _id: clientId }],
      role: { $in: ['company', 'direct_client'] },
      isActive: true,
    });
    if (userCount >= license.maxUsers) {
      return next(new AppError('User limit reached for this license.', 403));
    }
  }
  req.license = license;
  next();
};
