import { AppError } from '../utils/AppError.js';

export const getClientId = (req, res, next) => {
  if (req.user.role === 'super_admin') {
    req.clientId = null;
    req.clientModel = null;
    return next();
  }
  if (req.user.role === 'company') {
    req.clientId = req.user.companyId;
    req.clientModel = 'Company';
  } else {
    req.clientId = req.user._id;
    req.clientModel = 'User';
  }
  if (!req.clientId) {
    return next(new AppError('No client context.', 403));
  }
  next();
};
