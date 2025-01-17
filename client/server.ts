import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { Parser } from '../src/libs/pptr';
import { parseAvitoPage } from '../src/parsers/avito';

const app = express();
const PORT = 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public')); 

let formData: any = {}; 

app.post('/submit', async (req: Request, res: Response): Promise<void> => {
    formData = req.body; 
    console.log('Полученные данные:', formData); 

    if (!formData.query) {
        res.status(400).json({ error: 'Параметр запроса обязателен.' });
        return; 
    }

    const parser = new Parser();

    try {
        await parser.launch();
        const page = await parser.newPage();

        const allEmployees: any[] = [];
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

        res.json({ message: 'Данные успешно получены', data: allEmployees }); 
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
