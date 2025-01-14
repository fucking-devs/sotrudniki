import { Page } from 'puppeteer'

export const parseAvitoTitle = async (page:Page) =>
{
  await page.waitForSelector('.page-title-text-CBgaH.page-title-inline-LU8GK');

  const title = await page.evaluate(() => {

  const elementTitle = document.querySelector('.page-title-text-CBgaH.page-title-inline-LU8GK') as HTMLElement;
  return elementTitle ? elementTitle.innerText : null;
  });
   
  return title;
}