"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FAQItem {
    question: string;
    answer: string;
}

const faqs: FAQItem[] = [
    {
        question: "How does the Astro Wallet work?",
        answer: "The Astro Wallet is your digital balance on JyotishConnect. You can securely recharge it using Razorpay (via Credit/Debit Cards, UPI, or Net Banking). Your wallet balance is then used to instantly book video, audio, or chat consultations with our expert Astrologers without repeatedly entering card details."
    },
    {
        question: "How do Video / Audio Consultations work?",
        answer: "Once you book a slot, the required amount is deducted from your Wallet. You and the astrologer will both receive a professional email invite with a direct 'Join Consultation Room' link (similar to Google Meet). Simply click the link precisely at your scheduled time to connect securely."
    },
    {
        question: "Who is 'Sarvagya' (The AI Chatbot)?",
        answer: "Sarvagya is our integrated AI Astrology Assistant powered by advanced large language models. While Sarvagya accurately processes your Kundli data using astronomical math, its chat responses are AI-generated text meant for instant entertainment and generalized insights. For serious life questions, always book a Verified Human Astrologer."
    },
    {
        question: "Are your astrologers background verified?",
        answer: "Yes, every human astrologer listed on JyotishConnect goes through a strict manual vetting process. We review their Vedic astrology expertise, identity, and past experience before they are granted an Astrologer Portal account."
    },
    {
        question: "Can I get a refund if the prediction is wrong?",
        answer: "No. Astrology is a matter of traditional belief, and predictions cannot be guaranteed. Therefore, we do not offer refunds based on dissatisfaction with an astrologer's reading or AI chat outputs. We only issue refunds for severe technical failures (e.g., platform crashes) or if the astrologer failed to join the video session."
    },
    {
        question: "Is my birth data secure?",
        answer: "Yes. Your Date, Time, and Place of birth are highly sensitive data points. We transmit them securely via SSL directly to the Swiss Ephemeris prediction engine and AI nodes strictly for chart calculation. Your data is not sold to marketers."
    },
    {
        question: "What languages are available for my Kundli?",
        answer: "Our automated Kundli engine fully supports English, Hindi, Marathi, Bengali, Gujarati, Tamil, Telugu, and Kannada. Simply change the language toggle at the top of the site, and the entire Kundli prediction interface will translate smoothly."
    },
    {
        question: "Can astrologers give me medical or stock market advice?",
        answer: "Absolutely not. Astrologers are strictly instructed not to provide medical, legal, or financial trading advice. Any such conversation violates our Terms of Service. Please consult a licensed physician or registered SEBI advisor for such matters."
    }
];

function FAQAccordion({ item }: { item: FAQItem }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-primary/20 rounded-lg overflow-hidden bg-card/50 backdrop-blur-sm">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-primary/5 transition-colors"
            >
                <h3 className="font-semibold text-foreground pr-4">{item.question}</h3>
                {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-primary flex-shrink-0" />
                )}
            </button>
            {isOpen && (
                <div className="px-6 py-4 border-t border-primary/10 bg-background/50">
                    <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
                </div>
            )}
        </div>
    );
}

export default function FAQPage() {
    return (
        <div className="min-h-screen py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Clarifying how our Consultations, AI, and Wallet features operate.
                    </p>
                </div>

                {/* Disclaimer */}
                <div className="mb-8 p-6 rounded-lg border border-amber-500/30 bg-amber-500/5">
                    <p className="text-sm text-muted-foreground">
                        <strong className="text-amber-600">Disclaimer:</strong> Astrological services
                        and the "Sarvagya" AI provided on this platform are strictly for entertainment and spiritual guidance.
                    </p>
                </div>

                {/* FAQ Items */}
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <FAQAccordion key={index} item={faq} />
                    ))}
                </div>

                {/* Contact CTA */}
                <div className="mt-12 text-center p-8 rounded-lg bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20">
                    <h2 className="text-2xl font-bold mb-3">Still have critical questions?</h2>
                    <p className="text-muted-foreground mb-6">
                        Our corporate support team is available via email to resolve billing or platform issues.
                    </p>
                    <a
                        href="/contact"
                        className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                    >
                        Contact Operations
                    </a>
                </div>
            </div>
        </div>
    );
}
