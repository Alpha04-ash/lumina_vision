import { OpenAI } from "openai";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
    try {
        const { messages, image } = await req.json();

        if (!process.env.OPENAI_API_KEY) {
            return new Response(JSON.stringify({ error: "Missing OpenAI API Key." }), {
                status: 401,
                headers: { "Content-Type": "application/json" }
            });
        }

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        if (!messages) {
            return new Response(JSON.stringify({ error: "Messages are required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Get the latest user message
        const lastMessage = messages[messages.length - 1];
        const previousMessages = messages.slice(0, -1);

        // Prepare the message content for the latest message
        let userContent: any[] = [{ type: "text", text: lastMessage.content }];

        // If an image is provided, attach it to the latest message
        if (image) {
            userContent.push({
                type: "image_url",
                image_url: {
                    url: image, // Assumes base64 data URI
                },
            });
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content:
                        "You are Lumina, a ultra-high-end AI assistant for the visually impaired. You can see the user's camera feed. ALWAYS respond with beautiful Markdown formatting (use lists, bold text, and clear headings). Your voice is natural and professional. Be concise but warm.",
                },
                ...previousMessages,
                {
                    role: "user",
                    content: userContent,
                }
            ],
            max_tokens: 500,
            stream: true,
        });

        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    for await (const chunk of response) {
                        const content = chunk.choices[0]?.delta?.content || "";
                        if (content) {
                            controller.enqueue(encoder.encode(content));
                        }
                    }
                } catch (err) {
                    controller.error(err);
                } finally {
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });
    } catch (error: any) {
        console.error("Chat API Error:", error);
        return new Response(JSON.stringify({ error: "Failed to generate response" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
