import puppeteer, { Browser } from 'puppeteer';

export class Parser {
    browser?: Browser;

    async launch() {
        this.browser = await puppeteer.launch({
            headless: false, 
        });
    }

    async newPage() {
        if (!this.browser) {
            await this.launch();
        }

        const page = await this.browser!.newPage();
        await page.setViewport({ width: 1080, height: 1920 });
        return page;
    }

    async close() {
        await this.browser?.close();
    }
}
