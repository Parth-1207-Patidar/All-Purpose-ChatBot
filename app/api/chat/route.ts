import { NextResponse, NextRequest } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const sessionMemory: { [sessionId: string]: any[] } = {};


const instructions = process.env.INSTRUCTIONS;

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
