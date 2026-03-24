"use client";

import { useState } from "react";
import { Mail, ShieldAlert, Phone, MapPin, Clock, Send } from "lucide-react";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        type: "general"
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 5000);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="min-h-screen py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                        Corporate Contact Hub
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        For business inquiries, refund disputes, or reporting platform abuse, please contact the appropriate department below.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Contact Information */}
                    <div className="space-y-6">
                        <div className="p-6 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm">
                            <h2 className="text-2xl font-bold mb-6">Department Directories</h2>

                            <div className="space-y-4">
                                {/* Customer Support */}
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg bg-primary/10">
                                        <Mail className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Customer & Billing Support</h3>
                                        <p className="text-sm text-muted-foreground">For Razorpay wallet issues or failed video calls.</p>
                                        <p className="text-xs text-primary mt-1 font-mono">support@astropanditconnect.com</p>
                                    </div>
                                </div>

                                {/* Astrologer Onboarding */}
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg bg-primary/10">
                                        <Phone className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Astrologer Onboarding</h3>
                                        <p className="text-sm text-muted-foreground">Are you a Vedic expert looking to join the platform?</p>
                                        <p className="text-xs text-primary mt-1 font-mono">partners@astropanditconnect.com</p>
                                    </div>
                                </div>

                                {/* Grievance */}
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg bg-red-500/10">
                                        <ShieldAlert className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Legal & Abuse Reports</h3>
                                        <p className="text-sm text-muted-foreground">To report a violation of terms or report abusive behavior during sessions.</p>
                                        <p className="text-xs text-primary mt-1 font-mono">legal@astropanditconnect.com</p>
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="flex items-start gap-4 mt-6">
                                    <div className="p-3 rounded-lg bg-primary/10">
                                        <MapPin className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Corporate Headquarters</h3>
                                        <p className="text-sm text-muted-foreground">
                                            AstroPandit Connect LLC<br />
                                            (Fictional Address / To Be Assigned)<br />
                                            New Delhi, India<br />
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="p-6 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold mb-6">Submit a Ticket</h2>

                        {submitted && (
                            <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-600">
                                Ticket lodged successfully. Our operations team will contact you within 24-48 business hours.
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium mb-2">Registered Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-primary/20 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium mb-2">Registered Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-primary/20 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>

                            <div>
                                <label htmlFor="type" className="block text-sm font-medium mb-2">Ticket Category</label>
                                <select
                                    id="type"
                                    name="type"
                                    required
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-primary/20 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    <option value="support">Technical Support (Video Call Failure)</option>
                                    <option value="billing">Wallet Recharge / Razorpay Issue</option>
                                    <option value="legal">Report Harassment / Code of Conduct Violation</option>
                                    <option value="astrologer">Astrologer Application</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium mb-2">Message Description</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    required
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={5}
                                    className="w-full px-4 py-2 rounded-lg border border-primary/20 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                Transmit Ticket
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
