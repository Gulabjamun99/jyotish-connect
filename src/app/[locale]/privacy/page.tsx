export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                        Privacy Policy
                    </h1>
                    <p className="text-muted-foreground">
                        Last Updated: March 24, 2026
                    </p>
                </div>

                {/* Content */}
                <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">

                    {/* Introduction */}
                    <section className="p-6 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold mb-4">Introduction</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            JyotishConnect ("<strong>we</strong>", "<strong>us</strong>", or "<strong>our</strong>")
                            is deeply committed to protecting your highly sensitive personal data. This Privacy Policy outlines our strict adherence to the Digital Personal Data Protection Act, 2023 (DPDP Act) and the Information Technology Act, 2000 regarding the processing of your astrological and identification data.
                        </p>
                    </section>

                    {/* Data We Collect */}
                    <section className="p-6 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold mb-4">1. Information We Collect and Why</h2>
                        <p className="text-muted-foreground mb-2">We require specific data strictly to generate astrological charts:</p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                            <li><strong>Birth Details (Mandatory):</strong> Date of birth, exact time of birth, and geographic coordinates (latitude/longitude) of your birthplace. This is sent to our astronomical engines (e.g., Swiss Ephemeris) to compute planetary degrees.</li>
                            <li><strong>Account Information:</strong> Name, authenticated email address, and encrypted passwords.</li>
                            <li><strong>Consultation Data:</strong> Chat logs with Astrologers, queries posed to our AI ("Sarvagya"), and video appointment records.</li>
                            <li><strong>Financial Status:</strong> We log wallet balances and transaction IDs. We do NOT collect, view, or store raw Credit Card numbers or UPI PINs; these are processed securely by Razorpay.</li>
                        </ul>
                    </section>

                    {/* Third-Party Data Sharing */}
                    <section className="p-6 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold mb-4">2. Safe Processing & Third Parties</h2>
                        <p className="text-muted-foreground mb-4">
                            We do not sell your personal data to data brokers. However, to operate the platform, data is routed through highly vetted partners:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                            <li><strong>AI Partners (Google Gemini):</strong> When you consult the AI Assistant, your query and the anonymous astrological parameters of your chart are securely transmitted via API to generate responses. We do not transmit your email or phone number to the AI models.</li>
                            <li><strong>Astrologers:</strong> The independent experts you book will have access to your birth chart and consultation history solely to provide their reading.</li>
                            <li><strong>Payment Gateways (Razorpay):</strong> Required identifiers are passed to facilitate secure checkouts.</li>
                            <li><strong>Backend Infrastructure (Firebase):</strong> Used for secure auth and database hosting under strict encryption protocols.</li>
                        </ul>
                    </section>

                    {/* Content Moderation & Recordings */}
                    <section className="p-6 rounded-lg border border-amber-500/30 bg-amber-500/5">
                        <h2 className="text-2xl font-bold mb-4 text-amber-600">3. Video Consultations & Chat Logs</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            To ensure the safety of our Verified Astrologers and to resolve any billing disputes, all text chats with Astrologers are securely logged. 
                            If a video consultation is conducted, it may run through Google Meet or custom platforms. We reserve the right to audit metadata (session length, connection logs) to determine refund eligibility.
                        </p>
                    </section>

                    {/* Data Retention */}
                    <section className="p-6 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold mb-4">4. Data Retention & Deletion</h2>
                        <p className="text-muted-foreground mb-4">
                            We retain your Kundli data to allow you to instantly retrieve charts upon login.
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                            <li>You have the explicit right to request account deletion under the DPDP Act.</li>
                            <li>If requested, your PII (Personally Identifiable Information) and birth records will be permanently purged from our active Firebase servers.</li>
                            <li>Anonymized financial transaction records will be retained for up to 7 years exclusively to comply with Indian taxation and anti-money laundering regulations.</li>
                        </ul>
                    </section>

                    {/* Contact Policy */}
                    <section className="p-6 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold mb-4">5. Contact Our Privacy Officer</h2>
                        <p className="text-muted-foreground mb-4">
                            For any inquiries regarding data processing, the right to deletion, or DPDP Act compliance, reach out directly:
                        </p>
                        <div className="bg-background/50 p-4 rounded-lg">
                            <p className="text-sm">
                                <strong>Privacy Team</strong><br />
                                Email: privacy@astropanditconnect.com<br />
                            </p>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}
