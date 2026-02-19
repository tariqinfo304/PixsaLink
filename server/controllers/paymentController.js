import Vendor from '../models/Vendor.js';
import VendorPayment from '../models/VendorPayment.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';

export const createPayment = catchAsync(async (req, res, next) => {
  const { vendorId, amount, paymentDate } = req.body;
  if (!vendorId || amount == null || amount <= 0) {
    return next(new AppError('Vendor ID and positive amount are required.', 400));
  }
  const vendor = await Vendor.findOne({ _id: vendorId, clientId: req.clientId });
  if (!vendor) return next(new AppError('Vendor not found.', 404));
  if (vendor.balance < amount) return next(new AppError('Insufficient vendor balance.', 400));

  const payment = await VendorPayment.create({
    vendorId,
    clientId: req.clientId,
    clientModel: req.clientModel,
    amount: Number(amount),
    paymentDate: paymentDate || new Date(),
    addedBy: req.user._id,
  });

  vendor.balance = vendor.balance - Number(amount);
  await vendor.save();

  const populated = await VendorPayment.findById(payment._id)
    .populate('vendorId', 'name balance')
    .populate('addedBy', 'name');
  res.status(201).json({ status: 'success', data: { payment: populated } });
});

export const getPayments = catchAsync(async (req, res, next) => {
  const payments = await VendorPayment.find({ clientId: req.clientId })
    .populate('vendorId', 'name balance')
    .populate('addedBy', 'name')
    .sort({ paymentDate: -1 });
  res.status(200).json({ status: 'success', data: { payments }, count: payments.length });
});

export const deletePayment = catchAsync(async (req, res, next) => {
  const payment = await VendorPayment.findOne({ _id: req.params.id, clientId: req.clientId });
  if (!payment) return next(new AppError('Payment not found.', 404));
  const vendor = await Vendor.findById(payment.vendorId);
  if (vendor && vendor.clientId.toString() === req.clientId.toString()) {
    vendor.balance = vendor.balance + payment.amount;
    await vendor.save();
  }
  await VendorPayment.findByIdAndDelete(req.params.id);
  res.status(200).json({ status: 'success', message: 'Payment deleted. Vendor balance restored.' });
});
