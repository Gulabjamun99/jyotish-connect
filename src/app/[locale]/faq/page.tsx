"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FAQItem {
    question: string;
    answer: string;
}

const faqs: FAQItem[] = [
    {
        question: "What is JyotishConnect?",
        answer: "JyotishConnect is an online platform that connects you with verified and experienced astrologers for personalized consultations. We offer various services including birth chart analysis, horoscope readings, kundli matching, and video/audio consultations."
    },
    {
        question: "Are your astrologers verified?",
        answer: "Yes, all astrologers on our platform undergo a thorough verification process. We verify their credentials, experience, and expertise in Vedic astrology. Each astrologer must provide valid identification and demonstrate their knowledge before being approved to offer consultations."
    },
    {
        question: "How accurate are astrological predictions?",
        answer: "Astrology is a traditional belief system and interpretive art. While our astrologers are highly experienced, predictions are based on astrological principles and should be viewed as guidance rather than absolute certainties. Results may vary, and astrology should not replace professional medical, legal, or financial advice."
    },
    {
        question: "What information do I need to provide for a consultation?",
        answer: "For an accurate astrological reading, you'll typically need to provide your date of birth, time of birth (as accurate as possible), and place of birth. Some consultations may require additional information depending on the specific service you're requesting."
    },
    {
        question: "How do I book a consultation?",
        answer: "Simply browse our verified astrologers, view their profiles, specializations, and availability. Select your preferred astrologer, choose a consultation type (chat, audio, or video call), and book a time slot that works for you. Payment is processed securely through our platform."
    },
    {
        question: "What payment methods do you accept?",
        answer: "We accept various payment methods including credit/debit cards, UPI, net banking, and digital wallets through our secure payment gateway powered by Razorpay. All transactions are encrypted and secure."
    },
    {
        question: "What is your refund policy?",
        answer: "Refunds are processed in accordance with the Consumer Protection Act, 2019. If you experience technical issues that prevent your consultation, or if an astrologer fails to join the session, you're eligible for a full refund. Refund requests must be submitted within 48 hours of the consultation. Please note that refunds are not provided for completed consultations or if you're dissatisfied with the astrological guidance provided."
    },
    {
        question: "How long does a typical consultation last?",
        answer: "Consultation duration varies by service type. Chat consultations are typically charged per message or per minute. Audio and video calls are usually available in 15, 30, or 60-minute sessions. The exact duration and pricing are displayed on each astrologer's profile."
    },
    {
        question: "Is my personal information safe?",
        answer: "Yes, we take data privacy very seriously. We comply with the Digital Personal Data Protection Act, 2023. Your personal information, including birth details and consultation history, is encrypted and stored securely. We never share your data with third parties without your explicit consent. For more details, please read our Privacy Policy."
    },
    {
        question: "Can I get a consultation in my preferred language?",
        answer: "Yes! Our astrologers speak various languages including Hindi, English, Tamil, Telugu, Bengali, Marathi, and more. You can filter astrologers by language preference when browsing our directory."
    },
    {
        question: "What if I'm not satisfied with my consultation?",
        answer: "While we cannot guarantee specific outcomes (as astrology is interpretive), we strive for quality service. If you have concerns about your consultation, please contact our support team within 48 hours. We have a grievance redressal mechanism in place and will investigate your complaint thoroughly."
    },
    {
        question: "Can astrologers provide medical or legal advice?",
        answer: "No. Our astrologers are strictly prohibited from providing medical, legal, or financial advice. Astrological consultations are for spiritual guidance and entertainment purposes only. For health, legal, or financial matters, please consult qualified professionals in those respective fields."
    },
    {
        question: "Do you offer services for minors (under 18)?",
        answer: "Users must be 18 years or older to create an account and book consultations. For consultations regarding minors, a parent or legal guardian must book and attend the session on their behalf."
    },
    {
        question: "How do I report an issue or file a complaint?",
        answer: "You can report issues through our Contact Us page, email us at support@astropanditconnect.com, or use the grievance redressal form. We acknowledge all complaints within 48 hours and aim to resolve them within 30 days."
    },
    {
        question: "Can I download my birth chart or consultation report?",
        answer: "Yes! After your consultation, you can download your birth chart (Kundli) in PDF format from your user dashboard. Some astrologers also provide detailed consultation reports that you can save for future reference."
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
                        Find answers to common questions about our astrology consultation services,
                        privacy, payments, and more.
                    </p>
                </div>

                {/* Disclaimer */}
                <div className="mb-8 p-6 rounded-lg border border-amber-500/30 bg-amber-500/5">
                    <p className="text-sm text-muted-foreground">
                        <strong className="text-amber-600">Disclaimer:</strong> Astrological services
                        provided on this platform are for entertainment and spiritual guidance purposes
                        based on traditional belief systems. Predictions are not guaranteed and should
                        not be considered as substitutes for professional medical, legal, or financial advice.
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
                    <h2 className="text-2xl font-bold mb-3">Still have questions?</h2>
                    <p className="text-muted-foreground mb-6">
                        Our support team is here to help you with any additional queries.
                    </p>
                    <a
                        href="/contact"
                        className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                    >
                        Contact Us
                    </a>
                </div>
            </div>
        </div>
    );
}
