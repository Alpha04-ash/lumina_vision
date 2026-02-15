import { OpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { image, mode = "narrator" } = await req.json();

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({ error: "Missing OpenAI API Key. Please add it to your .env.local file." }, { status: 401 });
        }

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        if (!image) {
            return NextResponse.json(
                { error: "Image data is required" },
                { status: 400 }
            );
        }

        let systemPrompt = "You are Lumina, an intelligent assistant for the visually impaired. Analyze the image provided and describe the scene. Focus on key elements such as obstacles, people, text, and safety hazards. Be concise but descriptive. Speak as if you are guiding the user in real-time.";

        if (mode === "safety") {
            systemPrompt = `You are a SAFETY GUARDIAN for a blind person. Analyze the image for IMMEDIATE HAZARDS in their direct path.

CLASSIFICATION & RESPONSE RULES:
1. If NO HAZARDS: Reply ONLY with "Safe".
2. If MINOR HAZARDS (Uneven ground, distant obstacle): Reply "Caution: [Hazard]"
3. If IMMEDIATE DANGER (Stairs, moving vehicle, low-hanging branch): Reply "STOP! [Hazard] ahead!"

Be extremely concise. Use only the exact phrases above. Priority 1 is safety. Priority 2 is brevity.`;
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: systemPrompt,
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: mode === "safety" ? "Scan for hazards." : "What is in front of me?",
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: image, // Expecting data:image/jpeg;base64,...
                            },
                        },
                    ],
                },
            ],
            max_tokens: 300,
        });

        const description = response.choices[0].message.content;

        return NextResponse.json({ description });
    } catch (error: any) {
        console.error("Vision API Error:", error);
        const errorMessage = error.error?.message || error.message || "Failed to analyze image";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
