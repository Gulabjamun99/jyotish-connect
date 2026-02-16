"use client";

import { useState } from "react";
import { Mail, Phone, MessageCircle, MapPin, Clock, Send } from "lucide-react";

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
        // TODO: Implement actual form submission to backend
        console.log("Form submitted:", formData);
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
                        Contact Us
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Have questions or need assistance? We're here to help! Reach out to us through any of the channels below.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Contact Information */}
                    <div className="space-y-6">
                        <div className="p-6 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm">
                            <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>

                            <div className="space-y-4">
                                {/* Email */}
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg bg-primary/10">
                                        <Mail className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Email Support</h3>
                                        <p className="text-sm text-muted-foreground">support@astropanditconnect.com</p>
                                        <p className="text-xs text-muted-foreground mt-1">We respond within 24 hours</p>
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg bg-primary/10">
                                        <Phone className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Phone Support</h3>
                                        <p className="text-sm text-muted-foreground">+91 98765 43210</p>
                                        <p className="text-xs text-muted-foreground mt-1">Mon-Sat: 9:00 AM - 6:00 PM IST</p>
                                    </div>
                                </div>

                                {/* WhatsApp */}
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg bg-primary/10">
                                        <MessageCircle className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">WhatsApp</h3>
                                        <p className="text-sm text-muted-foreground">+91 98765 43210</p>
                                        <p className="text-xs text-muted-foreground mt-1">Quick responses during business hours</p>
                                    </div>
                                </div>

                                {/* Business Hours */}
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg bg-primary/10">
                                        <Clock className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Business Hours</h3>
                                        <p className="text-sm text-muted-foreground">Monday - Saturday: 9:00 AM - 6:00 PM</p>
                                        <p className="text-sm text-muted-foreground">Sunday: Closed</p>
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg bg-primary/10">
                                        <MapPin className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Registered Office</h3>
                                        <p className="text-sm text-muted-foreground">
                                            AstroPandit Connect<br />
                                            123, Jyotish Bhawan<br />
                                            MG Road, Connaught Place<br />
                                            New Delhi, Delhi - 110001<br />
                                            India
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Grievance Redressal */}
                        <div className="p-6 rounded-lg border border-amber-500/30 bg-amber-500/5">
                            <h3 className="font-semibold mb-2 text-amber-600">Grievance Redressal Officer</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                                For complaints or grievances as per Consumer Protection Act, 2019:
                            </p>
                            <p className="text-sm">
                                <strong>Name:</strong> Rajesh Kumar (Grievance Officer)<br />
                                <strong>Email:</strong> grievance@astropanditconnect.com<br />
                                <strong>Response Time:</strong> Acknowledged within 48 hours, resolved within 30 days
                            </p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="p-6 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>

                        {submitted && (
                            <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-600">
                                Thank you! Your message has been sent successfully. We'll get back to you soon.
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium mb-2">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-primary/20 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="Your name"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium mb-2">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-primary/20 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="your.email@example.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-primary/20 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="+91 XXXXXXXXXX"
                                />
                            </div>

                            <div>
                                <label htmlFor="type" className="block text-sm font-medium mb-2">
                                    Inquiry Type *
                                </label>
                                <select
                                    id="type"
                                    name="type"
                                    required
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-primary/20 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    <option value="general">General Inquiry</option>
                                    <option value="support">Technical Support</option>
                                    <option value="billing">Billing & Payments</option>
                                    <option value="refund">Refund Request</option>
                                    <option value="complaint">Complaint/Grievance</option>
                                    <option value="astrologer">Astrologer Partnership</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium mb-2">
                                    Subject *
                                </label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    required
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-primary/20 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="Brief subject of your inquiry"
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium mb-2">
                                    Message *
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    required
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={5}
                                    className="w-full px-4 py-2 rounded-lg border border-primary/20 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                    placeholder="Please provide details about your inquiry..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
