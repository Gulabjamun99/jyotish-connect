"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Minimize2, User, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { toast } from "react-hot-toast";

interface ChatMessage {
    id: string;
    sender: "user" | "bot";
    text: string;
    time: string;
}

const FAQ_RESPONSES: { [key: string]: string } = {
    "hello": "Namaste! 🙏 Welcome to JyotishConnect. How can I help you today?",
    "hi": "Hello! How can I assist you with your astrological consultation?",
    "price": "Our consultation prices vary by type:\n• Video: ₹50\n• Audio: ₹35 (30% off)\n• Chat: ₹25 (50% off)",
    "pricing": "Our consultation prices vary by type:\n• Video: ₹50\n• Audio: ₹35 (30% off)\n• Chat: ₹25 (50% off)",
    "book": "To book a consultation:\n1. Browse our verified astrologers\n2. Select your preferred consultation type\n3. Choose a time slot\n4. Complete payment\n5. Join your session!",
    "booking": "To book a consultation:\n1. Browse our verified astrologers\n2. Select your preferred consultation type\n3. Choose a time slot\n4. Complete payment\n5. Join your session!",
    "refund": "Refunds are available for:\n• Technical issues on our end\n• Astrologer no-show\n• Duplicate charges\n\nPlease contact support@jyotishconnect.com within 48 hours.",
    "payment": "We accept all major payment methods through Razorpay:\n• Credit/Debit Cards\n• UPI\n• Net Banking\n• Wallets",
    "help": "I can help you with:\n• Booking consultations\n• Pricing information\n• Refund policies\n• Technical support\n\nType your question or contact support@jyotishconnect.com",
    "support": "For immediate assistance:\n📧 Email: support@jyotishconnect.com\n📞 Phone: +91 98765 43210\n⏰ Mon-Sat: 9 AM - 6 PM IST"
};

export function HelpChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [hasJoined, setHasJoined] = useState(false);
    const [userDetails, setUserDetails] = useState({ name: "", email: "", phone: "" });
    const [loading, setLoading] = useState(false);

    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: "1",
            sender: "bot",
            text: "Namaste! 🙏 Welcome to JyotishConnect. How can I help you today?",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [inputText, setInputText] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, hasJoined, isOpen]);

    const handleJoin = async () => {
        if (!userDetails.name || !userDetails.email || !userDetails.phone) {
            toast.error("Please fill in all details to start chat");
            return;
        }

        setLoading(true);
        try {
            await addDoc(collection(db, "leads"), {
                ...userDetails,
                source: "help_chat",
                createdAt: new Date().toISOString()
            });
            setHasJoined(true);
            toast.success("Connected to support!");
        } catch (error) {
            console.error("Error saving lead:", error);
            // Allow join on error fallback or show error? Better to allow join gracefully if DB fails?
            // User requirement: "must take details". Assuming DB success for now.
            setHasJoined(true); // Fallback to let them chat even if lead save fails locally
        } finally {
            setLoading(false);
        }
    };

    const getBotResponse = (userMessage: string): string => {
        const lowerMessage = userMessage.toLowerCase();

        // Check for exact matches first
        for (const [key, response] of Object.entries(FAQ_RESPONSES)) {
            if (lowerMessage.includes(key)) {
                return response;
            }
        }

        // Default response
        return "I'm here to help! For specific queries, please contact our support team at support@jyotishconnect.com or call +91 98765 43210 (Mon-Sat, 9 AM - 6 PM IST).";
    };

    const handleSend = () => {
        if (!inputText.trim()) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            sender: "user",
            text: inputText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText("");

        // Bot response after a delay
        setTimeout(() => {
            const botResponse: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: "bot",
                text: getBotResponse(inputText),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, botResponse]);
        }, 800);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-16 h-16 bg-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50 animate-bounce"
            >
                <MessageCircle className="w-8 h-8 text-white" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
            </button>
        );
    }

    if (isMinimized) {
        return (
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => setIsMinimized(false)}
                    className="glass px-6 py-3 rounded-full border border-primary/20 flex items-center gap-3 hover:scale-105 transition-transform shadow-xl"
                >
                    <MessageCircle className="w-5 h-5 text-primary" />
                    <span className="font-bold text-sm">Help Chat</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-96 h-[32rem] glass rounded-3xl border border-primary/20 shadow-2xl flex flex-col z-50 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-orange-500 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <div className="font-bold text-white text-sm">JyotishConnect Support</div>
                        <div className="text-xs text-white/80 flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full" />
                            Online
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsMinimized(true)}
                        className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                        <Minimize2 className="w-4 h-4 text-white" />
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                        <X className="w-4 h-4 text-white" />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {hasJoined ? (
                <>
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div className={`max-w-[80%] ${msg.sender === "user" ? "order-2" : "order-1"}`}>
                                    <div className="text-[9px] text-muted-foreground mb-1 px-2">
                                        {msg.time}
                                    </div>
                                    <div
                                        className={`p-3 rounded-2xl ${msg.sender === "user"
                                            ? "bg-primary text-white rounded-tr-sm"
                                            : "bg-muted rounded-tl-sm"
                                            }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-primary/10 bg-background">
                        <div className="flex gap-2">
                            <Input
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your question..."
                                className="flex-1 bg-background/50 border-primary/20"
                            />
                            <Button
                                onClick={handleSend}
                                disabled={!inputText.trim()}
                                size="icon"
                                className="bg-primary hover:bg-primary/90"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                        <p className="text-[9px] text-muted-foreground mt-2 text-center">
                            Powered by JyotishConnect AI
                        </p>
                    </div>
                </>
            ) : (
                <div className="flex-1 p-6 flex flex-col justify-center space-y-6 bg-background/95">
                    <div className="text-center space-y-2">
                        <h3 className="font-bold text-lg">Start Conversation</h3>
                        <p className="text-xs text-muted-foreground">Please share your details so we can assist you better.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Your Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                <Input
                                    className="pl-9 bg-muted/50"
                                    placeholder="Enter full name"
                                    value={userDetails.name}
                                    onChange={(e) => setUserDetails(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                <Input
                                    className="pl-9 bg-muted/50"
                                    placeholder="your@email.com"
                                    type="email"
                                    value={userDetails.email}
                                    onChange={(e) => setUserDetails(prev => ({ ...prev, email: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">WhatsApp Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                <Input
                                    className="pl-9 bg-muted/50"
                                    placeholder="+91 98765 43210"
                                    type="tel"
                                    value={userDetails.phone}
                                    onChange={(e) => setUserDetails(prev => ({ ...prev, phone: e.target.value }))}
                                />
                            </div>
                        </div>
                    </div>

                    <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleJoin} disabled={loading}>
                        {loading ? "Connecting..." : "Start Chat"}
                    </Button>
                </div>
            )}
        </div>
    );
}
