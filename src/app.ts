import express, { Request, Response } from 'express'
import path from 'path'
import mongoose from 'mongoose'
import { Parser } from './libs/pptr'
import { parseAvitoPage } from './parsers/avito'
import { config } from 'dotenv'
import xlsx from 'xlsx'
import Employee from './models/Employee'
import fs from 'fs'
config()

const app = express()

const { PORT, MONGO_URL } = process.env

if (!PORT || !MONGO_URL) throw new Error('PORT or MONGO_URL is not defined')


mongoose.connect(MONGO_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err))

app.use(express.static(path.join(__dirname, '../client')))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get('/export', async (req, res) => {
  try {
    const employees = await Employee.find()
    
    const formattedData = [
      ['Title', 'Description', 'Salary', 'Link'],
      ...employees.map(employee => [employee.title, employee.desc, employee.salary, employee.href])
    ]

    const workSheet = xlsx.utils.aoa_to_sheet(formattedData)
    const workBook = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(workBook, workSheet, 'Employees')

    const filePath = path.join(__dirname, '../Employees.xlsx')
    xlsx.writeFile(workBook, filePath)

    res.download(filePath, 'Employees.xlsx', (err) => {
      if (err) console.error('Download error:', err)
      fs.unlinkSync(filePath) 
    })
  } catch (err) {
    console.error('Export error:', err)
    res.status(500).send('Internal Server Error')
  }
})

app.post('/submit', async (req, res) => {
  try {
    const { position, city } = req.body
    if (!position || !city) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const parser = new Parser()
    await parser.launch()

    const page = await parser.newPage()
    const employees = await parseAvitoPage(page, position, city) 
    
    await Employee.deleteMany({}) 
    await Employee.insertMany(employees)

    await parser.close()

    res.json({
      message: 'Данные успешно собраны',
      data: employees
    })
  } catch (err) {
    console.error('Submit error:', err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.listen(PORT, () => console.log(`Сервер запущен на http://localhost:${PORT}`))
