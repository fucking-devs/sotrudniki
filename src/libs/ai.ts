import OpenAI from 'openai';
import { Employee } from '../models/Employee';

export class OpenAIModel {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({
            baseURL: 'https://api.proxyapi.ru/openai/v1',
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    async isEmployeeSuitable(employee: Employee, position: string): Promise<boolean> {
        const prompt = `Определи, подходит ли кандидат на позицию "${position}". Ответь только "да" или "нет".
            
            Данные кандидата:
            - Должность: ${employee.title}
            ${employee.desc ? `- Описание: ${employee.desc}` : ''}
            ${employee.salary ? `- Зарплата: ${employee.salary}` : ''}`;

        const response = await this.openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: "user", content: prompt }],
            max_tokens: 10
        });

        return response.choices[0]?.message?.content?.toLowerCase().startsWith('да') ?? false;
    }
}
