"use client";

import { MessageCircle, Send, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
    id: string;
    sender: "user" | "astrologer";
    senderName: string;
    text: string;
    time: string;
}

interface ChatInterfaceProps {
    consultationId: string;
    userName: string;
    astrologerName: string;
    onSendMessage: (message: Message) => void;
    messages: Message[];
    timeLeft: number;
    onEndSession: () => void;
}

export function ChatInterface({ consultationId, userName, astrologerName, onSendMessage, messages, timeLeft, onEndSession }: ChatInterfaceProps) {
    const [inputText, setInputText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        scrollToBottom();

        // Simulated Astrologer behavior for demo sessions
        if (consultationId === 'demo-session' && messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.sender === 'user') {
                setIsTyping(true);
                const delay = 1500 + Math.random() * 2000;

                setTimeout(() => {
                    let replyText = "The cosmic alignment suggests you are on a path of growth. Tell me more about your specific questions.";
                    const lowerText = lastMessage.text.toLowerCase();

                    if (lowerText.includes("future") || lowerText.includes("भविष्य")) {
                        replyText = "The Saturn transit this month will bring clarity to your long-term goals. I see a shift in your 9th house.";
                    } else if (lowerText.includes("job") || lowerText.includes("करीअर")) {
                        replyText = "Mars which is your career lord is currently well-placed in its own sign. Next 3 months are crucial.";
                    } else if (lowerText.includes("love") || lowerText.includes("marriage")) {
                        replyText = "Venus is currently in a trine position from your moon sign, creating favorable conditions for relationship harmony.";
                    }

                    const reply: Message = {
                        id: Date.now().toString(),
                        sender: "astrologer",
                        senderName: astrologerName,
                        text: replyText,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    };

                    onSendMessage(reply);
                    setIsTyping(false);
                }, delay);
            }
        }
    }, [messages, consultationId, astrologerName, onSendMessage]);

    const handleSend = () => {
        if (!inputText.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            sender: "user",
            senderName: userName,
            text: inputText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        onSendMessage(newMessage);
        setInputText("");
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-background via-background to-primary/5">
            {/* Header */}
            <div className="glass p-6 border-b border-primary/10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {astrologerName[0]}
                    </div>
                    <div>
                        <h2 className="font-bold text-lg">{astrologerName}</h2>
                        <div className="flex items-center gap-2 text-xs text-green-500">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Online - Chat Consultation
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <div className={`text-2xl font-black tabular-nums tracking-tight ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-foreground'}`}>
                        {formatTime(timeLeft)}
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Remaining</span>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <MessageCircle className="w-16 h-16 text-primary/20 mb-4" />
                        <p className="text-muted-foreground">Start your consultation by sending a message</p>
                    </div>
                )}

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div className={`max-w-[70%] ${msg.sender === "user" ? "order-2" : "order-1"}`}>
                            <div className="text-[10px] font-bold text-muted-foreground mb-1 px-2">
                                {msg.senderName} • {msg.time}
                            </div>
                            <div
                                className={`p-4 rounded-2xl ${msg.sender === "user"
                                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                                    : "glass border border-primary/10 rounded-tl-sm"
                                    }`}
                            >
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="glass p-4 rounded-2xl rounded-tl-sm border border-primary/10">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="glass p-6 border-t border-primary/10">
                <div className="flex gap-3">
                    <Input
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="flex-1 h-12 px-4 bg-background/50 border-primary/20 rounded-xl focus:border-primary/50"
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!inputText.trim()}
                        className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90"
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 text-center">
                    Press Enter to send • Shift+Enter for new line
                </p>
            </div>
        </div>
    );
}
