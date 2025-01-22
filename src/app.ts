import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';
import { Parser } from '../src/libs/pptr';
import { parseAvitoPage } from '../src/parsers/avito';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('client'));

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

    if (isNaN(formData.age) || isNaN(formData.experience)) {
        res.status(400).json({ error: 'Возраст и опыт работы должны быть числами.' });
        return;
    }

    const parser = new Parser();
    const allEmployees: any[] = [];

    try {
        await parser.launch();
        const page = await parser.newPage();
        let currentPage = 1;

        while (true) {
            const link = `https://www.avito.ru/volgograd/rezume?cd=1&p=${currentPage}&q=${encodeURIComponent(formData.query)}`;
            
            await page.goto(link, { timeout: 50000 });
            const avitoData = await parseAvitoPage(page);
            allEmployees.push(...avitoData);

            const nextPageElement = await page.$("a.styles-module-item_last-ucP91");
            if (!nextPageElement) {
                break;
            }

            currentPage++;
            await new Promise((resolve) => setTimeout(resolve, 2000));
        }

     
        const dirPath = path.join(__dirname, '../data');
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
        }

        const filePath = path.join(dirPath, 'data.json');
        const existingData = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : [];
        
        existingData.push(...allEmployees);
        fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

        console.log('Данные успешно сохранены:', allEmployees);

        res.json({ message: 'Данные успешно получены и сохранены', data: allEmployees });
    } catch (error) {
        console.error('Ошибка при обработке запроса:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    } finally {
        await parser.close();
    }
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
