import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ITransaction extends Document {
  userId: string
  type: 'sale' | 'expense'
  amount: number
  description: string
  category: string
  paymentMode: 'cash' | 'upi' | 'credit'
  createdAt: Date
  updatedAt: Date
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { type: String, required: true, index: true },
    type: { type: String, enum: ['sale', 'expense'], required: true },
    amount: { type: Number, required: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'general' },
    paymentMode: {
      type: String,
      enum: ['cash', 'upi', 'credit'],
      default: 'cash',
    },
  },
  { timestamps: true },
)

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ??
  mongoose.model<ITransaction>('Transaction', TransactionSchema)
export default Transaction
