import { Page } from 'puppeteer'
import { parse } from 'node-html-parser'
import { Employee } from '../models/Employee'

export const parseAvitoPage = async (page: Page, position: string, city: string): Promise<Employee[]> => {
  const employees: Employee[] = []
  let currentPage = 1

  const query = encodeURIComponent(position)
  city = encodeURIComponent(city)

  while (true) {
    const link = `https://www.avito.ru/${city}/rezume?cd=1&p=${currentPage}&q=${query}`
    await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 50_000 })

    const cards = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('div.iva-item-root-Se7z4')).map((el) => el.innerHTML)
    })

    cards.forEach((rawCard) => {
      const card = parse(rawCard)

      const title = card.querySelector('.styles-module-root-s3nJ7')?.innerText ?? 'не указано'
      const desc = card
        .querySelectorAll('.iva-item-descriptionStep-i2icy p')
        .map((el) => el.innerText)
        .join(' ')
      const salary = card.querySelector('.styles-module-root-LEIrw')?.innerText ?? 'не указана'
      const href = card.querySelector('a')?.getAttribute('href')

      if (!href) return

      employees.push({
        title,
        desc,
        salary,
        href
      })
    })

    const nextPageElement = await page.$('a.styles-module-item_last-ucP91')

    if (!nextPageElement) break

    currentPage++
    await new Promise((resolve) => setTimeout(resolve, 2000)) 
  }

  return employees
}

