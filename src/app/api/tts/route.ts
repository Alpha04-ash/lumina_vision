import { OpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { text, voice = "shimmer" } = await req.json();

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({ error: "Missing OpenAI API Key" }, { status: 401 });
        }

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        if (!text) {
            return NextResponse.json(
                { error: "Text is required" },
                { status: 400 }
            );
        }

        const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: voice as any,
            input: text,
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": "audio/mpeg",
                "Content-Length": buffer.length.toString(),
            },
        });
    } catch (error: any) {
        console.error("TTS API Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate speech" },
            { status: 500 }
        );
    }
}
