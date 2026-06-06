import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUser extends Document {
  phone: string
  name: string
  businessName: string
  businessType: 'kirana' | 'tuition' | 'tailor'
  language: 'en' | 'hi' | 'mr'
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    phone: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    businessName: { type: String, required: true },
    businessType: {
      type: String,
      enum: ['kirana', 'tuition', 'tailor'],
      required: true,
    },
    language: { type: String, enum: ['en', 'hi', 'mr'], default: 'en' },
  },
  { timestamps: true },
)

const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>('User', UserSchema)
export default User
