import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IBillItem {
  name: string
  quantity: number
  unit: string
  price: number
}

export interface IBill extends Document {
  userId: string
  vendorName: string
  items: IBillItem[]
  totalAmount: number
  status: 'paid' | 'unpaid'
  billDate: Date
  imageUrl?: string
  rawText?: string
  createdAt: Date
  updatedAt: Date
}

const BillItemSchema = new Schema<IBillItem>(
  {
    name: String,
    quantity: Number,
    unit: String,
    price: Number,
  },
  { _id: false },
)

const BillSchema = new Schema<IBill>(
  {
    userId: { type: String, required: true, index: true },
    vendorName: { type: String, required: true },
    items: [BillItemSchema],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
    billDate: { type: Date, default: () => new Date() },
    imageUrl: String,
    rawText: String,
  },
  { timestamps: true },
)

const Bill: Model<IBill> =
  mongoose.models.Bill ?? mongoose.model<IBill>('Bill', BillSchema)
export default Bill
