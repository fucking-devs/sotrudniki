import { Parser } from "./libs/pptr";
import mongoose, { Document, Schema } from 'mongoose';
import { parseAvitoPage } from "./parsers/avito";

const mongoUrl = 'mongodb://localhost:27017/AvitoParsers';

interface IEmployee extends Document {
  title: string;
  desc?: string;
  salary?: string;
  href: string;
}

const EmployeeSchema: Schema = new Schema({
  title: { type: String, required: true },
  desc: { type: String, required: false },
  salary: { type: String, required: true },
  href: { type: String, required: true },
});

const Employee = mongoose.model<IEmployee>('Employee', EmployeeSchema);

async function connectDB() {
  try {
    await mongoose.connect(mongoUrl, {
    });
    console.log('MongoDB подключен');
  } catch (error) {
    console.error('Ошибка подключения к MongoDB:', error);
    process.exit(1);
  }
}

function cleanSalary(salary: string | undefined): string {
  if (!salary) return 'Зарплата не указана';
  return salary.replace(/&nbsp;/g, ' ').replace(/₽/g, '').trim();
}

async function main() {
  await connectDB();

  const parser = new Parser();
  await parser.launch();
  const page = await parser.newPage();

  const allEmployees = [];
  let currentPage = 1;

  while (true) {
    const link = `https://www.avito.ru/volgograd/rezume?cd=1&p=${currentPage}&q=%D0%B7%D0%B0%D0%BB%D0%B8%D0%B2%D0%BA%D0%B0+%D0%B1%D0%B5%D1%82%D0%BE%D0%BD%D0%B0`;

    await page.goto(link, { timeout: 50_000 });

    const avitoData = await parseAvitoPage(page);
    
    const cleanedData = avitoData.map(employeeData => ({
      ...employeeData,
      salary: cleanSalary(employeeData.salary),
    }));

    allEmployees.push(...cleanedData);

    for (const employeeData of cleanedData) {
      const employee = new Employee(employeeData);
      try {
        await employee.save();
        console.log(`Сохранено: ${employeeData.title}`);
      } catch (error) {
        console.error('Ошибка при сохранении сотрудника:', error);
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
  await mongoose.connection.close();
}

main().catch(console.error);
