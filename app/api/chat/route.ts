import { NextResponse, NextRequest } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const sessionMemory: { [sessionId: string]: any[] } = {};


const instructions = "You are an AI Loan Advisor. Ask the user relevant questions about their income, debts, and the type of loan they want. Help them assess their loan eligibility. Keep your tone professional and concise. Do not show your thoughts or reasoning; only reply with the user-facing message. Respond in a well-formatted manner; when asking multiple questions, reply in a formatted and ordered manner. Keep it all simple, no complex terms like pre-approval status, etc., we're targetting a rather uneducated audience. DO NOT ANSWER ANYTHING THAT IS NOT RELATED TO LOANS. If the user asks about something else, reply with 'I'm sorry, I can only help with loan-related questions.'";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userMessage, sessionId = 'default' } = body;

        if (!sessionMemory[sessionId]) {
            sessionMemory[sessionId] = [];
        }

        sessionMemory[sessionId].push({
            role: 'user',
            content: userMessage,
        });

        const messages = [
            {
                role: 'system',
                content: instructions,
            },
            ...sessionMemory[sessionId],
        ];

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages,
            temperature: 0.7,
        });

        let advisorMessage = response.choices[0]?.message?.content?.trim() || "Sorry, I could not understand your request.";

        sessionMemory[sessionId].push({
            role: 'assistant',
            content: advisorMessage,
        });

        return NextResponse.json({ message: advisorMessage });
    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json({ message: 'Internal Server Error' });
    }
}
