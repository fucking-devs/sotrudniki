import mongoose, { Document, Schema } from 'mongoose';

export interface Employee extends Document {
    title: string;
    desc: string;
    salary: string;
    href: string;
}

const employeeSchema = new Schema({
    title: { type: String, required: true },
    desc: { type: String, required: true },
    salary: { type: String, required: true },
    href: { type: String, required: true }
});

export default mongoose.model<Employee>('Employee', employeeSchema);
