import { Page } from 'puppeteer'
import { parse } from 'node-html-parser'

interface Element extends HTMLDivElement {
  querySelector(selector: string): { innerText: string }
}

export const parseAvitoPage = async (page: Page) => {
  const employees: {
    title?: string,
    desc?: string,
    salary?: string
  }[] = []

  const cards = await page.evaluate(() => {
    return [...document.querySelectorAll('div.iva-item-root-Se7z4')].map((el) => el.innerHTML)
  })

  for (let i = 0; i < cards.length; i++) {
    const card = parse(cards[i]) 

    employees.push({
      // TODO: добавить поле href, которое сохраняет ссылку на резюме
      title: card.querySelector('.styles-module-root-s3nJ7')?.innerText,
      desc: card.querySelector('.styles-module-root-s4tZ2.styles-module-size_s-nEvE8.styles-module-size_s_compensated-wyNaE')?.innerText,
      salary: card.querySelector('.styles-module-root-LEIrw')?.innerText
    })
  }

  return employees
}
