import { Page } from 'puppeteer'

export const parseAvitoPage = async (page: Page) => {
  const employees: {
    title: string,
    desc: string,
    salary: number
  }[] = []

  // const cards = await page.$$eval('.iva-item-root-Se7z4.photo-slider-slider-ZccM3.iva-item-list-CLaiS.iva-item-redesign-H4ow9.iva-item-responsive-GCo6h.items-item-Reit3.items-listItem-rKPls.js-catalog-item-enum', async (els) => els.map((el: any) => el.innerText))
  // console.log(cards)
  return await page.evaluate(() => {
    const data = document.querySelector('a')
    // 'iva-item-root-Se7z4.photo-slider-slider-ZccM3.iva-item-list-CLaiS.iva-item-redesign-H4ow9.iva-item-responsive-GCo6h.items-item-Reit3.items-listItem-rKPls.js-catalog-item-enum'

    console.log(data)

    // return cards
  })
}
