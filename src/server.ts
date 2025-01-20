import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import mongoose from 'mongoose';
import fs from 'fs';
import Submission from './schemas/schemaServer'; 

const app = express();
const PORT = process.env.PORT || 5000;

mongoose.connect('mongodb://localhost:27017/anketa')
.then(() => console.log('Подключение к MongoDB успешно'))
.catch(err => console.error('Ошибка подключения к MongoDB:', err));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req: Request, res: Response) => {
  const indexPath = path.join(__dirname, '../client', 'index.html');
  fs.readFile(indexPath, 'utf8', (err: NodeJS.ErrnoException | null, data: string) => {
    if (err) {
      res.status(500).send('Ошибка загрузки index.html');
      return;
    }
    res.send(data);
  });
});

app.post('/submit', async (req: Request, res: Response): Promise<void> => {
  const formData = req.body;

  console.log('Полученные данные:', formData);

  if (!formData.query) {
    res.status(400).json({ error: 'Параметр query обязателен.' });
    return;
  }

  try {
    const submission = new Submission({
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

    await submission.save();

    console.log('Данные успешно сохранены:', submission);

    res.json({ message: 'Данные успешно сохранены', data: submission });
  } catch (error) {
    console.error('Ошибка при обработке запроса:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
