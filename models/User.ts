import mongoose, { Schema, Document, Model } from 'mongoose'

/** A Paytm merchant — the user who logs into the app. */
export interface IUser extends Document {
  phone: string
  name: string
  businessName: string
  businessType: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    phone: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    businessName: { type: String, default: '' },
    businessType: { type: String, default: 'other' },
  },
  { timestamps: true },
)

const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>('User', UserSchema)
export default User
