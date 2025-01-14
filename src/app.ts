// import express from 'express'

import { Parser } from "./libs/pptr"
import { parseAvitoPage } from "./parsers/avito"

// const app = express()

// app.use(express.static('client'))

// app.listen(5000, () => {
    
// })

async function main() {
    const parser = new Parser()

    await parser.launch()

    const page = await parser.newPage()

    // TODO: добавить цикл, который пробегается по страницам

    const link = 'https://www.avito.ru/volgograd/rezume?cd=1&p=1&q=%D0%B7%D0%B0%D0%BB%D0%B8%D0%B2%D0%BA%D0%B0+%D0%B1%D0%B5%D1%82%D0%BE%D0%BD%D0%B0'

    await page.goto(link, { timeout: 50_000 })

    const avitoData = await parseAvitoPage(page)

    console.log(avitoData)

    await parser.close()
}

main()