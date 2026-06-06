import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IInventory extends Document {
  userId: string
  itemName: string
  quantity: number
  unit: string
  reorderThreshold: number
  lastUpdated: Date
  createdAt: Date
  updatedAt: Date
}

const InventorySchema = new Schema<IInventory>(
  {
    userId: { type: String, required: true, index: true },
    itemName: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0 },
    unit: { type: String, default: 'kg' },
    reorderThreshold: { type: Number, default: 5 },
    lastUpdated: { type: Date, default: () => new Date() },
  },
  { timestamps: true },
)

const Inventory: Model<IInventory> =
  mongoose.models.Inventory ??
  mongoose.model<IInventory>('Inventory', InventorySchema)
export default Inventory
