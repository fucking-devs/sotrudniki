import express, { Request, Response } from "express";
import path from "path";
import mongoose from "mongoose";
import fs from "fs";
import { Parser } from "./libs/pptr";
import { parseAvitoPage } from "./parsers/avito";
import { config } from "dotenv";
import xlsx from "xlsx";
import Employee from "./models/Employee";

config();

const app = express();

const { PORT, MONGO_URL } = process.env;

if (!PORT || !MONGO_URL) throw new Error('PORT or MONGO_URL is not defined')

mongoose.connect(MONGO_URL);

app.use(express.static(path.join(__dirname, "../client")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/export", async (req, res) => {
  const employees = await Employee.find();

  const formattedData = [
    ["Title", "Description", "Salary", "Link"],
    ...employees.map((employee) => [
      employee.title,
      employee.desc,
      employee.salary,
      employee.href,
    ]),
  ];

  const employeeWorkSheet = xlsx.utils.aoa_to_sheet(formattedData);
  const employeeWorkBook = xlsx.utils.book_new();

  xlsx.utils.book_append_sheet(employeeWorkBook, employeeWorkSheet, "Employees");

  const filePath = path.join(__dirname, "../data/Employees.xlsx");
  
  xlsx.writeFile(employeeWorkBook, filePath);

  res.download(filePath, "Employees.xlsx");
});

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

app.post("/submit", async (req: Request, res: Response) => {
  const { position, city, prompt } = req.body

  const parser = new Parser();
  await parser.launch();
  
  const page = await parser.newPage();

  const employees = parseAvitoPage(page, position, city)

  await parser.close();

  await Employee.create(employees)
  
  res.json({
    message: "успешно",
    data: employees,
  });
});

app.listen(PORT, () => console.log(`Сервер запущен на http://localhost:${PORT}`));
