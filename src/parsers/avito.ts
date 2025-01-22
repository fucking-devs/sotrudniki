import { Page } from 'puppeteer';
import { parse } from 'node-html-parser';

interface Employee {
  title?: string;
  desc?: string;
  salary?: string;
  href?: string;
}

export const parseAvitoPage = async (page: Page): Promise<Employee[]> => {
  const employees: Employee[] = [];

  const cards = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('div.iva-item-root-Se7z4')).map((el) => el.innerHTML);
  });

  for (let i = 0; i < cards.length; i++) {
    const card = parse(cards[i]);

    
    const title = card.querySelector('.styles-module-root-s3nJ7')?.innerText;

    
    const descriptionElements = card.querySelectorAll('.iva-item-descriptionStep-i2icy p');
    const descriptions = descriptionElements.map(el => el.innerText).join(' '); 

    
    const salary = card.querySelector('.styles-module-root-LEIrw')?.innerText;

    
    const href = card.querySelector('a')?.getAttribute('href');

    employees.push({
      title,
      desc: descriptions, 
      salary,
      href
    });
  }

  return employees;
}
