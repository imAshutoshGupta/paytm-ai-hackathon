import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUdhaar extends Document {
  userId: string
  customerName: string
  amount: number
  amountPaid: number
  note: string
  status: 'pending' | 'partial' | 'paid'
  dueDate?: Date
  createdAt: Date
  updatedAt: Date
}

const UdhaarSchema = new Schema<IUdhaar>(
  {
    userId: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    amount: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    note: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'partial', 'paid'],
      default: 'pending',
    },
    dueDate: { type: Date },
  },
  { timestamps: true },
)

const Udhaar: Model<IUdhaar> =
  mongoose.models.Udhaar ?? mongoose.model<IUdhaar>('Udhaar', UdhaarSchema)
export default Udhaar
