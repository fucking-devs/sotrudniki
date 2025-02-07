import { model, Schema } from 'mongoose';

export interface Employee {
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

export default model<Employee>('Employee', employeeSchema);
