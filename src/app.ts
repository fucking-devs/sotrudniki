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
import Employee from "./models/Employee";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017/anketa";

interface FormData {
  query: string;
  city: string;
  customCity?: string;
}

app.get("/export", async (req, res) => {
  try {
    const employees: InstanceType<typeof schemaAvito>[] =
      await schemaAvito.find({});

    const formattedData = [
      ["Title", "Description", "Salary", "Link"],
      ...employees.map((employee) => [
        employee.title ?? "Нет данных",
        employee.desc ?? "Нет данных",
        employee.salary ?? "Нет данных",
        employee.href ?? "Нет данных",
      ]),
    ];

    console.log("Отформатированные данные:", formattedData);

    const ws = xlsx.utils.aoa_to_sheet(formattedData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Employees");

    const filePath = path.join(__dirname, "../data/Employees.xlsx");
    xlsx.writeFile(wb, filePath);

    if (fs.existsSync(filePath)) {
      console.log("Файл успешно создан:", filePath);
    } else {
      console.error("Ошибка: файл не был создан.");
    }

    res.download(filePath, "Employees.xlsx", (err) => {
      if (err) {
        console.error("Ошибка при загрузке файла:", err);
        res.status(500).send("Ошибка при загрузке файла");
      }
    });
  } catch (error) {
    console.error("Ошибка при генерации Excel файла:", error);
    res.status(500).send("Ошибка при генерации Excel файла");
  }
});

interface EmployeeType {
  _id: string;
  title: string;
  desc: string;
  salary: string;
  href: string;
  __v?: number;
}

const dirPath = path.join(__dirname, "../data");
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath);
}
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
  fs.readFile(
    indexPath,
    "utf8",
    (err: NodeJS.ErrnoException | null, data: string) => {
      if (err) {
        res.status(500).send("Ошибка загрузки index.html");
        return;
      }
      res.send(data);
    }
  );
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
    res.json({
      message: "Данные успешно сохранены и парсинг выполнен",
      data: submission,
    });
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
  const city =
    formData.city === "other"
      ? encodeURIComponent(formData.customCity || "")
      : formData.city;
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
