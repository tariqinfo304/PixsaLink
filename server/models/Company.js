import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Company name is required'] },
    CRN: {
      type: String,
      required: [true, 'CRN is required'],
      unique: true,
      validate: {
        validator: (v) => /^\d{10}$/.test(v),
        message: 'CRN must be exactly 10 digits',
      },
    },
    email: { type: String, trim: true },
    licenseType: {
      type: String,
      enum: ['limited', 'unlimited'],
      default: 'limited',
    },
    licenseExpiry: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Company', companySchema);
