import mongoose, { Schema, Document } from 'mongoose';

interface IAvito extends Document {
    title: string;
    desc?: string;
    salary?: string;
    href: string;
}

const AvitoSchema: Schema = new Schema({
    title: { type: String, required: true },
    desc: { type: String, required: false },
    salary: { type: String, required: true },
    href: { type: String, required: true },
});

const Avito = mongoose.models.Avito || mongoose.model<IAvito>('Avito', AvitoSchema);

export default Avito;
