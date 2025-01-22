import Submission from './schemaAnketa';
import { Request } from 'express';

export const createAnketa = (formData: any, req: Request) => {
  return new Submission({
    age: formData.age,
    experience: formData.experience,
    criminal: formData.criminal,
    position: formData.position,
    city: formData.city,
    customCity: formData['custom-city'],
    citizenship: formData.citizenship,
    customCitizenship: formData['custom-citizenship'],
    query: formData.query,
    userAgent: req.headers['user-agent'] as string,
    ipAddress: req.ip,
    timestamp: new Date(),
    additionalData: formData.additionalData || {},
  });
};