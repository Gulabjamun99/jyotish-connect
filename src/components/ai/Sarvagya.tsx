"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, X, Loader2, User, Calendar, Clock, MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    id: string;
    role: "user" | "model";
    content: string;
}

// Track birth detail collection state
interface BirthDetails {
    name?: string;
    dob?: string;
    tob?: string;
    place?: string;
}

interface SarvagyaProps {
    userData?: any;
}

export function Sarvagya({ userData }: SarvagyaProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [birthDetails, setBirthDetails] = useState<BirthDetails>({});
    const [detailsComplete, setDetailsComplete] = useState(false);

    // Build the initial greeting based on whether user data is available
    const getInitialMessage = () => {
        if (userData?.kundliData?.[0]) {
            return "Hi, I am **Sarvagya** from Jyotish Connect. I can tell you about your current problems according to Jyotish. Your birth details are already linked. Please ask your question directly.";
        }
        return "Hi, I am **Sarvagya** from Jyotish Connect. I can tell you about your current problems according to Jyotish. \n\nTo help you, please provide your **Name, Date of Birth, Time of Birth, and Birth Place**. This is **mandatory** for any astrological analysis.";
    };

    const [messages, setMessages] = useState<Message[]>([]);
    
    useEffect(() => {
        setMessages([
            {
                id: "initial",
                role: "model",
                content: getInitialMessage()
            }
        ]);
    }, []); // Only on mount to avoid hydration mismatch
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // Handle opening from external events
    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-sarvagya', handleOpen);
        return () => window.removeEventListener('open-sarvagya', handleOpen);
    }, []);

    // Check if user has provided all birth details in conversation
    const extractAndCheckDetails = (allMessages: Message[]) => {
        const conversationText = allMessages.map(m => m.content).join(" ");
        // Simple heuristic checks — if DOB pattern found (dd/mm/yyyy or similar), mark complete
        const hasDOB = /\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}\b/.test(conversationText);
        const hasTime = /\b\d{1,2}:\d{2}\s*(am|pm|AM|PM)?\b/.test(conversationText);
        const hasPlace = conversationText.toLowerCase().includes("born in") || 
                        conversationText.toLowerCase().includes("birth place") ||
                        conversationText.toLowerCase().includes("janam") ||
                        conversationText.length > 200; // If long conversation, assume details given
        return hasDOB && (hasTime || hasPlace);
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const newUserMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: inputValue.trim()
        };

        const newMessages = [...messages, newUserMessage];
        setMessages(newMessages);
        setInputValue("");
        setIsLoading(true);

        // Update details-complete flag
        const complete = extractAndCheckDetails(newMessages);
        setDetailsComplete(complete);

        try {
            // Build Context Data from saved profile or extracted details
            let contextData = null;
            if (userData?.kundliData) {
                const primaryProfile = userData.kundliData[0];
                contextData = {
                    name: userData.name || primaryProfile?.name,
                    birthInfo: primaryProfile?.rawInput,
                    ascendantSign: primaryProfile?.ascendant,
                    planets: primaryProfile?.planets,
                    doshas: primaryProfile?.doshas
                };
            } else if (birthDetails.name || birthDetails.dob) {
                contextData = birthDetails;
            }

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: newMessages,
                    contextData: contextData
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to communicate with Sarvagya.");
            }
            if (!response.body) throw new Error("No readable stream.");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            const modelMessageId = (Date.now() + 1).toString();
            
            // Add empty model message first
            setMessages(prev => [...prev, { id: modelMessageId, role: "model", content: "" }]);

            let accumulatedContent = "";
            let lastUpdateTime = Date.now();
            const UPDATE_INTERVAL = 80; // Update UI every 80ms

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                accumulatedContent += decoder.decode(value, { stream: true });
                
                // Throttle UI updates to prevent mobile crashes
                const currentTime = Date.now();
                if (currentTime - lastUpdateTime > UPDATE_INTERVAL) {
                    setMessages(prev => {
                        const newMessages = [...prev];
                        const lastIndex = newMessages.length - 1;
                        if (newMessages[lastIndex].id === modelMessageId) {
                            newMessages[lastIndex] = { ...newMessages[lastIndex], content: accumulatedContent };
                        }
                        return newMessages;
                    });
                    lastUpdateTime = currentTime;
                }
            }

            // Final update to ensure everything is rendered
            setMessages(prev => {
                const newMessages = [...prev];
                const lastIndex = newMessages.length - 1;
                if (newMessages[lastIndex].id === modelMessageId) {
                    newMessages[lastIndex] = { ...newMessages[lastIndex], content: accumulatedContent };
                }
                return newMessages;
            });
        } catch (error: any) {
            console.error("Sarvagya Error:", error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: "model",
                content: "The planetary alignments are disruptive right now. Please try again. \n\n*(Error: " + (error.message || "Unknown cosmic interference") + ")*"
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const quickPrompts = detailsComplete || userData?.kundliData ? [
        "Career prediction (5 lines)",
        "Marriage timings?",
        "Health issues?",
        "Financial status?"
    ] : [
        "My name is Rahul, 15/08/1990, 10:30 AM, Delhi",
        "I was born on 20/03/1995 at 6:15 PM in Mumbai"
    ];

    const handleReset = () => {
        setMessages([{ id: "initial", role: "model", content: getInitialMessage() }]);
        setBirthDetails({});
        setDetailsComplete(false);
    };

    // Render markdown-like bold text simply
    const renderContent = (content: string) => {
        const parts = content.split(/(\*\*[^*]+\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="text-white font-black">{part.slice(2, -2)}</strong>;
            }
            return <span key={i}>{part}</span>;
        });
    };

    return (
        <>
            {/* FAB Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.div
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 100, opacity: 0 }}
                        className="fixed top-1/2 -translate-y-1/2 right-0 z-[100] group"
                    >
                        {/* Glowing Hover Tooltip */}
                        <div className="absolute right-16 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:translate-x-0 translate-x-4">
                            <div className="relative">
                                {/* Glow Effect */}
                                <div className="absolute -inset-3 bg-amber-500/20 blur-xl rounded-full animate-pulse" />
                                {/* Tooltip Card */}
                                <div className="relative bg-zinc-900/95 backdrop-blur-xl border border-amber-500/30 rounded-2xl px-4 py-3 shadow-[0_0_30px_rgba(217,119,6,0.15)] whitespace-nowrap">
                                    <p className="text-[11px] font-bold text-amber-400 tracking-wide">
                                        ✨ Ask the stars anything...
                                    </p>
                                    <p className="text-[9px] text-zinc-500 font-medium mt-0.5">Vedic AI • Always Online</p>
                                    {/* Arrow */}
                                    <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-zinc-900/95 border-r border-t border-amber-500/30 rotate-45" />
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={() => setIsOpen(true)}
                            className="w-12 h-24 rounded-l-2xl glass-accent border border-accent/20 border-r-0 shadow-[-5px_0_20px_rgba(217,119,6,0.3)] hover:w-14 hover:shadow-[-8px_0_30px_rgba(217,119,6,0.5)] transition-all p-0 overflow-hidden relative flex flex-col items-center justify-center gap-2"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-accent/20 via-transparent to-primary/20 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Sparkles className="w-6 h-6 text-accent drop-shadow-md z-10" />
                            <span className="[writing-mode:vertical-lr] text-[10px] font-black uppercase tracking-widest text-accent z-10">Sarvagya</span>
                            <span className="absolute top-1 left-1 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                            </span>
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 50, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 50, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="fixed bottom-4 right-4 md:bottom-10 md:right-10 z-[100] w-[calc(100vw-2rem)] md:w-[460px] h-[620px] max-h-[90vh] glass bg-zinc-950/90 backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-[2rem] shadow-2xl shadow-black overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-gradient-to-r from-accent/10 to-transparent">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30 shadow-[0_0_15px_rgba(217,119,6,0.3)]">
                                    <Sparkles className="w-5 h-5 text-accent" />
                                </div>
                                <div>
                                    <h2 className="font-black text-white text-lg tracking-tight">Sarvagya</h2>
                                    <p className="text-[10px] text-accent font-bold uppercase tracking-widest flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(34,197,94,1)]" /> Vedic Guru Online
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" onClick={handleReset} title="New Conversation" className="text-zinc-500 hover:text-zinc-300 rounded-full hover:bg-white/5 w-8 h-8">
                                    <ChevronRight className="w-4 h-4 rotate-180" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white rounded-full hover:bg-white/5">
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Birth Details Status Bar */}
                        {!userData?.kundliData && (
                            <div className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 border-b border-white/5 ${detailsComplete ? 'bg-green-500/10 text-green-400' : 'bg-orange-500/5 text-zinc-500'}`}>
                                {detailsComplete ? (
                                    <>
                                        <span className="w-2 h-2 rounded-full bg-green-500" />
                                        Details Received • Analysis Active
                                    </>
                                ) : (
                                    <>
                                        <span className="w-2 h-2 rounded-full bg-orange-400/50 animate-pulse" />
                                        <span className="flex items-center gap-2">
                                            <User className="w-3 h-3" /> Name
                                            <Calendar className="w-3 h-3" /> DOB
                                            <Clock className="w-3 h-3" /> Time
                                            <MapPin className="w-3 h-3" /> Place — Required
                                        </span>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap space-y-1 ${
                                        msg.role === 'user' 
                                        ? 'bg-zinc-800 text-white rounded-br-sm' 
                                        : 'bg-accent/10 border border-accent/20 text-zinc-200 rounded-bl-sm'
                                    }`}>
                                        {/* Quick prompts on first message */}
                                        {msg.role === 'model' && idx === 0 && (
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {quickPrompts.slice(0, 2).map((p, i) => (
                                                    <span 
                                                        key={i} 
                                                        onClick={() => setInputValue(p)}
                                                        className="text-[10px] bg-accent/20 hover:bg-accent/40 text-accent font-bold px-2 py-1 rounded-full cursor-pointer transition-colors"
                                                    >
                                                        {p.length > 28 ? p.substring(0, 25) + "..." : p}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <div>
                                            {renderContent(msg.content)}
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

                        {/* Quick Prompt Suggestions (dynamic) */}
                        <div className="px-4 py-2 border-t border-white/5 flex gap-2 overflow-x-auto scrollbar-none">
                            {quickPrompts.map((p, i) => (
                                <button
                                    key={i}
                                    onClick={() => setInputValue(p)}
                                    className="flex-shrink-0 text-[10px] bg-white/5 hover:bg-accent/20 text-zinc-400 hover:text-accent font-bold px-3 py-1.5 rounded-full cursor-pointer transition-colors border border-white/5 hover:border-accent/30"
                                >
                                    {p.length > 24 ? p.substring(0, 22) + "..." : p}
                                </button>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-zinc-950/80 border-t border-white/5 backdrop-blur-xl">
                            <form onSubmit={handleSubmit} className="flex items-center gap-2 relative">
                                <Input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={detailsComplete || userData?.kundliData ? "Ask your question (concise)..." : "Share your Name, DOB, Time & Place..."}
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
                            <p className="text-center text-[9px] text-zinc-600 uppercase tracking-widest font-bold mt-2">
                                Sarvagya • Vedic Guidance from JyotishConnect
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
