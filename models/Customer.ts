import mongoose, { Schema, Document, Model } from 'mongoose'

/** A customer of a merchant — reconstructed from Paytm QR transaction history. */
export interface ICustomer extends Document {
  merchantId: string
  name: string
  phone: string
  transactionCount: number
  lastTransactionAmount: number
  averageTransactionValue: number
  /** Each past QR payment, most recent last. */
  transactionDates: Date[]
  createdAt: Date
  updatedAt: Date
}

const CustomerSchema = new Schema<ICustomer>(
  {
    merchantId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    transactionCount: { type: Number, default: 0 },
    lastTransactionAmount: { type: Number, default: 0 },
    averageTransactionValue: { type: Number, default: 0 },
    transactionDates: { type: [Date], default: [] },
  },
  { timestamps: true },
)

const Customer: Model<ICustomer> =
  mongoose.models.Customer ?? mongoose.model<ICustomer>('Customer', CustomerSchema)
export default Customer
