export interface Message {
    role: "user" | "assistant" | "system";
    content: string;
}

export interface Session {
    id: string;
    messages: Message[];
    timestamp: number;
}
