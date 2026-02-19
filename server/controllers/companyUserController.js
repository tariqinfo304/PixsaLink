import User from '../models/User.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';

export const getCompanyUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({ companyId: req.user.companyId, role: 'company' })
    .select('-password')
    .sort({ createdAt: -1 });
  res.status(200).json({ status: 'success', data: { users }, count: users.length });
});

export const createCompanyUser = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return next(new AppError('Name, email and password are required.', 400));
  if (password.length < 6) return next(new AppError('Password must be at least 6 characters.', 400));

  const count = await User.countDocuments({
    companyId: req.user.companyId,
    role: 'company',
    isActive: true,
  });
  if (req.license?.type === 'limited' && req.license?.maxUsers != null && count >= req.license.maxUsers) {
    return next(new AppError('User limit reached for your license. Contact admin.', 403));
  }

  const user = await User.create({
    name,
    email,
    password,
    role: 'company',
    companyId: req.user.companyId,
  });
  user.password = undefined;
  res.status(201).json({ status: 'success', data: { user } });
});

export const updateCompanyUser = catchAsync(async (req, res, next) => {
  const { name, email } = req.body;
  const update = {};
  if (name != null) update.name = name;
  if (email != null) update.email = email;

  const user = await User.findOneAndUpdate(
    { _id: req.params.id, companyId: req.user.companyId, role: 'company' },
    update,
    { new: true, runValidators: true }
  ).select('-password');
  if (!user) return next(new AppError('User not found.', 404));
  res.status(200).json({ status: 'success', data: { user } });
});

export const deactivateCompanyUser = catchAsync(async (req, res, next) => {
  const user = await User.findOneAndUpdate(
    { _id: req.params.id, companyId: req.user.companyId, role: 'company' },
    { isActive: false },
    { new: true }
  ).select('-password');
  if (!user) return next(new AppError('User not found.', 404));
  res.status(200).json({ status: 'success', data: { user }, message: 'User deactivated.' });
});
