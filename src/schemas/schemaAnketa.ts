import mongoose, { Schema, Document } from 'mongoose';

interface ISubmission extends Document {
  age: string;
  experience: string;
  criminal: string;
  position: string;
  city: string;
  customCity: string;
  citizenship: string;
  customCitizenship: string;
  query: string;
  userAgent: string;
  ipAddress: string;
  timestamp: Date;
  additionalData: object;
}

const AnketaSchema: Schema = new Schema({
  age: { type: String, required: true },
  experience: { type: String, required: true },
  criminal: { type: String, required: true },
  position: { type: String, required: true },
  city: { type: String, required: true },
  customCity: { type: String, default: '' },
  citizenship: { type: String, required: true },
  customCitizenship: { type: String, default: '' },
  query: { type: String, required: true },
  userAgent: { type: String, required: true },
  ipAddress: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  additionalData: { type: Object, default: {} },
});


const Submission = mongoose.models.Submission || mongoose.model<ISubmission>('Submission', AnketaSchema);

export default Submission;