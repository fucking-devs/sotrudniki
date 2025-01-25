import mongoose, { Schema, Document } from 'mongoose';

interface ISubmission extends Document {
  age: string | null; 
  experience: string | null; 
  criminal: string | null;
  position: string | null; 
  city: string; 
  customCity: string;
  citizenship: string | null; 
  customCitizenship: string;
  query: string; 
  userAgent: string; 
  ipAddress: string;
  timestamp: Date;
  additionalData: object;
}

const AnketaSchema: Schema = new Schema({
  age: { type: String, required: false }, 
  experience: { type: String, required: false },  
  criminal: { type: String, required: false }, 
  position: { type: String, required: false },  
  city: { type: String, required: true }, 
  customCity: { type: String, default: '' },
  citizenship: { type: String, required: false }, 
  customCitizenship: { type: String, default: '' },
  query: { type: String, required: true }, 
  userAgent: { type: String, required: true }, 
  ipAddress: { type: String, required: true }, 
  timestamp: { type: Date, default: Date.now },
  additionalData: { type: Object, default: {} },
});

const Submission = mongoose.models.Submission || mongoose.model<ISubmission>('Submission', AnketaSchema);

export default Submission;