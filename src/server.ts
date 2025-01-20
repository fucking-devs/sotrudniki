import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req: Request, res: Response) => {
    const indexPath = path.join(__dirname, '../client', 'index.html');
    fs.readFile(indexPath, 'utf8', (err, data) => {
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
        const dirPath = path.join(__dirname, '../data');
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
        }

        const filePath = path.join(dirPath, 'data.json');
        const existingData = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : [];
        
        existingData.push(formData);
        fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

        console.log('Данные успешно сохранены:', formData);

        res.json({ message: 'Данные успешно сохранены', data: formData });
    } catch (error) {
        console.error('Ошибка при обработке запроса:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
