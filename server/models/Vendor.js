import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'clientModel' },
    clientModel: { type: String, enum: ['Company', 'User'], required: true },
    name: { type: String, required: [true, 'Vendor name is required'] },
    balance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

vendorSchema.index({ clientId: 1 });

export default mongoose.model('Vendor', vendorSchema);
