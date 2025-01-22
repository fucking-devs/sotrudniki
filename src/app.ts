import express, { Request, Response } from "express";
import path from "path";
import mongoose from "mongoose";
import fs from "fs";
import { Parser } from "./libs/pptr";
import { parseAvitoPage } from "./parsers/avito";
import * as dotenv from "dotenv";
import schemaAvito from "./schemas/schemaAvito";
import { createAnketa } from "./schemas/createSubmisson";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017/anketa";

async function connectDB() {
  try {
    await mongoose.connect(mongoUrl, {});
    console.log("Подключение к MongoDB успешно");
  } catch (err) {
    console.error("Ошибка подключения к MongoDB:", err);
  }
}

app.use(express.static(path.join(__dirname, "../client")));

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
  const formData = req.body;
  console.log("Полученные данные:", formData);

  if (!formData.query) {
    res.status(400).json({ error: "Параметр query обязателен." });
    return;
  }

  try {
    const submission = createAnketa(formData, req);
    await submission.save();
    console.log("Данные успешно сохранены:", submission);
    res.json({ message: "Данные успешно сохранены", data: submission });
  } catch (error) {
    console.error("Ошибка при обработке запроса:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

async function fetchAvitoData() {
  const parser = new Parser();
  await parser.launch();
  const page = await parser.newPage();
  const allEmployees = [];
  let currentPage = 1;

  while (true) {
    const link = `https://www.avito.ru/volgograd/rezume?cd=1&p=${currentPage}&q=%D0%B7%D0%B0%D0%BB%D0%B8%D0%B2%D0%BA%D0%B0+%D0%B1%D0%B5%D1%82%D0%BE%D0%BD%D0%B0`;
    await page.goto(link, { timeout: 50_000 });

    const avitoData = await parseAvitoPage(page);
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

  console.log(allEmployees);
  await parser.close();
}

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Сервер запущен на http://localhost:${PORT}`);
  await fetchAvitoData();
});
