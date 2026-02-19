import mongoose from 'mongoose';

const licenseSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, refPath: 'clientModel', required: true },
    clientModel: { type: String, enum: ['Company', 'User'], required: true },
    type: {
      type: String,
      enum: ['limited', 'unlimited'],
      required: [true, 'License type is required'],
    },
    maxUsers: {
      type: Number,
      required: function () {
        return this.type === 'limited';
      },
    },
    expiryDate: { type: Date, required: [true, 'Expiry date is required'] },
    status: { type: String, enum: ['active', 'expired'], default: 'active' },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

licenseSchema.index({ clientId: 1, status: 1 });

export default mongoose.model('License', licenseSchema);
