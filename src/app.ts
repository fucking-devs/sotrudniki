import express, { Request, Response } from "express";
import path from "path";
import mongoose from "mongoose";
import fs from "fs";
import { Parser } from "./libs/pptr";
import { parseAvitoPage } from "./parsers/avito";
import * as dotenv from "dotenv";
import schemaAvito from "./schemas/schemaAvito";
import { createAnketa } from "./schemas/createSubmisson"; 
import xlsx from "xlsx";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017/anketa";

interface FormData {
  query: string;
  city: string;
  customCity?: string;
}

// Беда тута
const dirPath = path.join(__dirname, '../data');
if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
}

const jsonFilePath = path.join(dirPath, 'AvitoData.json');
const excelFilePath = path.join(dirPath, 'AvitoData.xlsx'); 

app.get("/export", async (req: Request, res: Response) => { 
    try {
        const employees = await schemaAvito.find({});
        const ws = xlsx.utils.json_to_sheet(employees);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, "Avito Data");
        xlsx.writeFile(wb, excelFilePath);
        
        const existingData = fs.existsSync(jsonFilePath) ? JSON.parse(fs.readFileSync(jsonFilePath, 'utf8')) : [];
        existingData.push(...employees);
        fs.writeFileSync(jsonFilePath, JSON.stringify(existingData, null, 2));

        console.log("Данные успешно сохранены в JSON файл:", jsonFilePath);
        console.log("Данные успешно сохранены в Excel файл:", excelFilePath);

        res.json({ message: "Файлы успешно созданы", jsonFilePath: "AvitoData.json", excelFilePath: "AvitoData.xlsx" });
    } catch (error) {
        console.error("Ошибка при экспорте данных:", error);
        res.status(500).json({ error: "Ошибка при экспорте данных" });
    }
});
// И тута вроде заканчивается
async function connectDB() {
    try {
        await mongoose.connect(mongoUrl, {});
        console.log("Подключение к MongoDB успешно");
    } catch (err) {
        console.error("Ошибка подключения к MongoDB:", err);
    }
}

app.use(express.static(path.join(__dirname, "../client")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    const indexPath = path.join(__dirname, "../client", "index.html");
    fs.readFile(indexPath, "utf8", (err: NodeJS.ErrnoException | null, data: string) => {
        if (err) {
            res.status(500).send("Ошибка загрузки index.html");
            return;
        }
        res.send(data);
    });
});

app.post("/submit", async (req: Request, res: Response): Promise<void> => {
    const formData: FormData = req.body;
    console.log("Полученные данные:", formData);

    if (!formData.query) {
        res.status(400).json({ error: "Параметр query обязателен." });
        return;
    }

    try {
        const submission = createAnketa(formData, req);
        await submission.save();
        console.log("Данные успешно сохранены:", submission);
        await fetchAvitoData(formData);
        res.json({ message: "Данные успешно сохранены и парсинг выполнен", data: submission });
    } catch (error) {
        console.error("Ошибка при обработке запроса:", error);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});

async function fetchAvitoData(formData: FormData) {
    const parser = new Parser();
    await parser.launch();
    const page = await parser.newPage();
    const allEmployees = [];
    let currentPage = 1;
    const query = encodeURIComponent(formData.query);
    const city = formData.city === 'other' ? encodeURIComponent(formData.customCity || '') : formData.city;
  console.log("Город:", city);
  console.log("Запрос:", query);

  if (!city || !query) {
    console.error("Город или запрос пустой");
    return;
  }

  while (true) {
    const link = `https://www.avito.ru/${city}/rezume?cd=1&p=${currentPage}&q=${query}`;
    console.log(`Запрос на страницу: ${link}`);
    await page.goto(link, { timeout: 50_000 });
    const avitoData = await parseAvitoPage(page);
    console.log("Полученные данные:", avitoData);
    allEmployees.push(...avitoData);

    for (const employeeData of avitoData) {
      const employee = new schemaAvito(employeeData);
      try {
        await employee.save();
        console.log(`Сохранено: ${employeeData.title}`);
      } catch (error) {
        console.error("Ошибка при сохранении сотрудника:", error);
      }
    }

    const nextPageElement = await page.$("a.styles-module-item_last-ucP91");
    if (!nextPageElement) {
      break;
    }

    currentPage++;
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log("Все сотрудники:", allEmployees);
  await parser.close();
}

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});