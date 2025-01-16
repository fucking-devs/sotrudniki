import { Parser } from "./libs/pptr";
import { parse } from "node-html-parser";
import { parseAvitoPage } from "./parsers/avito";

async function main() {
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

main();
