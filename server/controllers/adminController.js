import Company from '../models/Company.js';
import License from '../models/License.js';
import User from '../models/User.js';
import Vendor from '../models/Vendor.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';

export const createCompany = catchAsync(async (req, res, next) => {
  const { name, CRN, email, licenseType, licenseExpiry } = req.body;
  if (!name || !CRN) return next(new AppError('Name and CRN are required.', 400));
  if (!/^\d{10}$/.test(CRN)) return next(new AppError('CRN must be exactly 10 digits.', 400));
  const company = await Company.create({
    name,
    CRN,
    email: email || undefined,
    licenseType: licenseType || 'limited',
    licenseExpiry: licenseExpiry || undefined,
    createdBy: req.user._id,
  });
  res.status(201).json({ status: 'success', data: { company } });
});

export const getCompanies = catchAsync(async (req, res, next) => {
  const companies = await Company.find().populate('createdBy', 'name email').sort({ createdAt: -1 });
  res.status(200).json({ status: 'success', data: { companies }, count: companies.length });
});

export const updateCompany = catchAsync(async (req, res, next) => {
  const company = await Company.findByIdAndUpdate(
    req.params.id,
    { ...req.body },
    { new: true, runValidators: true }
  );
  if (!company) return next(new AppError('Company not found.', 404));
  res.status(200).json({ status: 'success', data: { company } });
});

export const deleteCompany = catchAsync(async (req, res, next) => {
  const company = await Company.findByIdAndDelete(req.params.id);
  if (!company) return next(new AppError('Company not found.', 404));
  await User.updateMany({ companyId: company._id }, { isActive: false });
  await License.updateMany({ clientId: company._id, clientModel: 'Company' }, { status: 'expired' });
  res.status(200).json({ status: 'success', message: 'Company deleted.' });
});

export const issueLicense = catchAsync(async (req, res, next) => {
  const { clientId, clientModel, type, maxUsers, expiryDate } = req.body;
  if (!clientId || !clientModel || !type || !expiryDate) {
    return next(new AppError('clientId, clientModel, type and expiryDate are required.', 400));
  }
  if (!['Company', 'User'].includes(clientModel)) return next(new AppError('Invalid clientModel.', 400));
  if (!['limited', 'unlimited'].includes(type)) return next(new AppError('Invalid license type.', 400));
  if (type === 'limited' && (maxUsers == null || maxUsers < 1)) {
    return next(new AppError('maxUsers is required for limited license.', 400));
  }
  const license = await License.create({
    clientId,
    clientModel,
    type,
    maxUsers: type === 'limited' ? maxUsers : undefined,
    expiryDate,
    issuedBy: req.user._id,
    status: 'active',
  });
  if (clientModel === 'Company') {
    await Company.findByIdAndUpdate(clientId, {
      licenseType: type,
      licenseExpiry: expiryDate,
    });
  }
  res.status(201).json({ status: 'success', data: { license } });
});

export const getAllVendors = catchAsync(async (req, res, next) => {
  const { companyId } = req.query;
  const filter = companyId ? { clientId: companyId, clientModel: 'Company' } : {};
  const vendors = await Vendor.find(filter)
    .populate('clientId', 'name CRN')
    .sort({ createdAt: -1 });
  res.status(200).json({ status: 'success', data: { vendors }, count: vendors.length });
});

export const getDirectClients = catchAsync(async (req, res, next) => {
  const users = await User.find({ role: 'direct_client', isActive: true })
    .select('name email')
    .sort({ createdAt: -1 });
  res.status(200).json({ status: 'success', data: { users }, count: users.length });
});
