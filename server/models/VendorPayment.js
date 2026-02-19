import mongoose from 'mongoose';

const vendorPaymentSchema = new mongoose.Schema(
  {
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'clientModel' },
    clientModel: { type: String, enum: ['Company', 'User'], required: true },
    amount: { type: Number, required: [true, 'Amount is required'], min: 0.01 },
    paymentDate: { type: Date, default: Date.now },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

vendorPaymentSchema.index({ clientId: 1 });

export default mongoose.model('VendorPayment', vendorPaymentSchema);
