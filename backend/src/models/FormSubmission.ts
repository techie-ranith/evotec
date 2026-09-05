import mongoose, { Document, Schema, Types } from 'mongoose';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface IFormSubmission extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  gender: Gender;
  mobileNumber: string;
  address: string;
  feedback?: string;
  userCreated: Types.ObjectId;                                
  dateCreated: Date;
  userModified?: Types.ObjectId;
  dateModified?: Date;
}

const formSubmissionSchema = new Schema<IFormSubmission>({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  gender: {
    type: String,
    enum: ['MALE', 'FEMALE', 'OTHER'],
    required: true,
  },
  mobileNumber: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  feedback: { type: String, trim: true },
  userCreated: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  dateCreated: { type: Date, required: true, default: Date.now },
  userModified: { type: Schema.Types.ObjectId, ref: 'User' },
  dateModified: { type: Date },
});

export const FormSubmission = mongoose.model<IFormSubmission>(
  'FormSubmission',
  formSubmissionSchema
);
