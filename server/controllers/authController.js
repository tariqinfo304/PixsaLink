import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import License from '../models/License.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new AppError('Please provide email and password.', 400));
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid email or password.', 401));
  }
  if (!user.isActive) return next(new AppError('Account is deactivated.', 401));

  if (user.role !== 'super_admin') {
    const clientId = user.role === 'company' ? user.companyId : user._id;
    const clientModel = user.role === 'company' ? 'Company' : 'User';
    const license = await License.findOne({ clientId, clientModel, status: 'active' }).sort({ expiryDate: -1 }).limit(1);
    if (!license) return next(new AppError('No active license. Contact admin.', 403));
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
  }

  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
    role: user.role,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    },
  });
});

export const register = catchAsync(async (req, res, next) => {
  const { name, email, password, role, companyId } = req.body;
  if (!name || !email || !password || !role) {
    return next(new AppError('Name, email, password and role are required.', 400));
  }
  if (password.length < 6) return next(new AppError('Password must be at least 6 characters.', 400));
  const allowedRoles = ['super_admin', 'company', 'direct_client'];
  if (!allowedRoles.includes(role)) return next(new AppError('Invalid role.', 400));
  if (role === 'company' && !companyId) return next(new AppError('Company ID required for company role.', 400));

  const user = await User.create({ name, email, password, role, companyId: role === 'company' ? companyId : undefined });
  const token = signToken(user._id);
  user.password = undefined;
  res.status(201).json({
    status: 'success',
    token,
    role: user.role,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    },
  });
});

export const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('-password');
  let license = null;
  if (req.user.role !== 'super_admin') {
    const clientId = req.user.role === 'company' ? req.user.companyId : req.user._id;
    const clientModel = req.user.role === 'company' ? 'Company' : 'User';
    license = await License.findOne({ clientId, clientModel, status: 'active' })
      .sort({ expiryDate: -1 })
      .limit(1)
      .populate('issuedBy', 'name');
  }
  res.status(200).json({ status: 'success', data: { user, license } });
});
