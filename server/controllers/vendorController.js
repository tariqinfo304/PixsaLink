import Vendor from '../models/Vendor.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';

export const createVendor = catchAsync(async (req, res, next) => {
  const { name, balance } = req.body;
  if (!name) return next(new AppError('Vendor name is required.', 400));
  const vendor = await Vendor.create({
    clientId: req.clientId,
    clientModel: req.clientModel,
    name,
    balance: balance != null ? Number(balance) : 0,
  });
  res.status(201).json({ status: 'success', data: { vendor } });
});

export const getVendors = catchAsync(async (req, res, next) => {
  const vendors = await Vendor.find({ clientId: req.clientId }).sort({ createdAt: -1 });
  res.status(200).json({ status: 'success', data: { vendors }, count: vendors.length });
});

export const updateVendor = catchAsync(async (req, res, next) => {
  const vendor = await Vendor.findOneAndUpdate(
    { _id: req.params.id, clientId: req.clientId },
    { ...req.body },
    { new: true, runValidators: true }
  );
  if (!vendor) return next(new AppError('Vendor not found.', 404));
  res.status(200).json({ status: 'success', data: { vendor } });
});

export const deleteVendor = catchAsync(async (req, res, next) => {
  const vendor = await Vendor.findOneAndDelete({ _id: req.params.id, clientId: req.clientId });
  if (!vendor) return next(new AppError('Vendor not found.', 404));
  res.status(200).json({ status: 'success', message: 'Vendor deleted.' });
});
