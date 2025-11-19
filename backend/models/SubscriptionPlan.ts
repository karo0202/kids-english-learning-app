import mongoose, { Schema, Document } from 'mongoose'

export interface ISubscriptionPlan extends Document {
  planId: string
  name: string
  description: string
  duration: number // in days
  price: number
  currency: string
  features: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const SubscriptionPlanSchema = new Schema<ISubscriptionPlan>(
  {
    planId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true, // days
    },
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    features: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model<ISubscriptionPlan>('SubscriptionPlan', SubscriptionPlanSchema)

