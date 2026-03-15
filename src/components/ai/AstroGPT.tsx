"use client";

import { useState, useRef, useEffect } from "react";
import { Copy, Plus, Send, Sparkles, X, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    id: string;
    role: "user" | "model";
    content: string;
}

interface AstroGPTProps {
    userData?: any;
}

export function AstroGPT({ userData }: AstroGPTProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "initial",
            role: "model",
            content: "Namaste. I am Astro-GPT, your personal Vedic Guru powered by the cosmos. Ask me about your destiny, current cycles, or relationships."
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const newUserMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: inputValue.trim()
        };

        setMessages(prev => [...prev, newUserMessage]);
        setInputValue("");
        setIsLoading(true);

        try {
            // Build Context Data
            let contextData = null;
            if (userData && userData.kundliData) {
                // If the user has saved a primary Kundli, pass it to the AI
                const primaryProfile = userData.kundliData[0]; // Simplified for v1
                contextData = {
                    name: userData.name || primaryProfile?.name,
                    birthInfo: primaryProfile?.rawInput,
                    ascendantSign: primaryProfile?.ascendant,
                    planets: primaryProfile?.planets,
                    doshas: primaryProfile?.doshas
                };
            }

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, newUserMessage],
                    contextData: contextData
                })
            });

            if (!response.ok) throw new Error("Failed to connect to the cosmos.");
            if (!response.body) throw new Error("No readable stream.");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            const modelMessageId = (Date.now() + 1).toString();
            setMessages(prev => [...prev, { id: modelMessageId, role: "model", content: "" }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value, { stream: true });
                setMessages(prev => prev.map(m => 
                    m.id === modelMessageId ? { ...m, content: m.content + chunk } : m
                ));
            }
        } catch (error: any) {
            console.error(error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: "model",
                content: "The planetary alignments are disruptive right now. Please try again later. (Error: " + error.message + ")"
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const suggestedPrompts = [
        "What is my Moon sign and its meaning?",
        "When will my career improve based on Dasa?",
        "Do I have Manglik Dosha?"
    ];

    return (
        <>
            {/* FAB Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="fixed bottom-6 right-24 z-[100] md:bottom-8 md:right-28"
                    >
                        <Button
                            onClick={() => setIsOpen(true)}
                            className="w-16 h-16 rounded-full glass-accent border border-accent/20 shadow-[0_0_30px_rgba(217,119,6,0.3)] hover:scale-110 hover:shadow-[0_0_40px_rgba(217,119,6,0.5)] transition-all p-0 overflow-hidden relative group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 via-transparent to-primary/20 animate-spin-slow opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Sparkles className="w-8 h-8 text-accent drop-shadow-md z-10" />
                            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-accent border-2 border-slate-900"></span>
                            </span>
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="fixed bottom-6 right-6 z-[100] w-[calc(100vw-3rem)] md:w-[450px] h-[600px] max-h-[85vh] glass bg-zinc-950/90 backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-[2rem] shadow-2xl shadow-black overflow-hidden flex flex-col md:bottom-24 md:right-8"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-gradient-to-r from-accent/10 to-transparent">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30 shadow-[0_0_15px_rgba(217,119,6,0.3)]">
                                    <Sparkles className="w-5 h-5 text-accent" />
                                </div>
                                <div>
                                    <h2 className="font-black text-white text-lg tracking-tight">Astro-GPT</h2>
                                    <p className="text-[10px] text-accent font-bold uppercase tracking-widest flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(34,197,94,1)]" /> AI Guru Online
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white rounded-full hover:bg-white/5">
                                <X className="w-6 h-6" />
                            </Button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                                        msg.role === 'user' 
                                        ? 'bg-zinc-800 text-white rounded-br-sm' 
                                        : 'bg-accent/10 border border-accent/20 text-zinc-200 rounded-bl-sm glass'
                                    }`}>
                                        {msg.role === 'model' && idx === 0 && (
                                            <div className="flex gap-2 mb-3">
                                                {suggestedPrompts.map((p, i) => (
                                                    <span 
                                                        key={i} 
                                                        onClick={() => { setInputValue(p); }}
                                                        className="text-[10px] bg-accent/20 hover:bg-accent/40 text-accent font-bold px-2 py-1 rounded-full cursor-pointer transition-colors"
                                                    >
                                                        {p.substring(0, 15)}...
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                            {msg.content}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                    <div className="glass bg-accent/5 border border-accent/10 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-zinc-950/80 border-t border-white/5 backdrop-blur-xl">
                            <form onSubmit={handleSubmit} className="flex items-center gap-2 relative">
                                <Input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Ask the cosmos..."
                                    className="h-12 bg-zinc-900 border-zinc-800 focus-visible:ring-accent/50 text-white rounded-xl pl-4 pr-12 placeholder:text-zinc-600"
                                    disabled={isLoading}
                                />
                                <Button
                                    type="submit"
                                    disabled={!inputValue.trim() || isLoading}
                                    className="absolute right-1 top-1 w-10 h-10 rounded-lg bg-accent hover:bg-accent/90 text-zinc-950 p-0 shadow-[0_0_15px_rgba(217,119,6,0.3)] disabled:opacity-50 disabled:shadow-none transition-all"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-1" />}
                                </Button>
                            </form>
                            <p className="text-center text-[9px] text-zinc-600 uppercase tracking-widest font-bold mt-3">
                                Astro-GPT • 100% NASA Swiss Ephemeris Data
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
