import mongoose, { Document, Schema, Types } from 'mongoose';

export type UserRole = 'CUSTOMER' | 'ADMIN';

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['CUSTOMER', 'ADMIN'],
      required: true,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);
