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
                        Last Updated: January 20, 2026
                    </p>
                </div>

                {/* Content */}
                <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">

                    {/* Introduction */}
                    <section className="p-6 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold mb-4">Introduction</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            JyotishConnect ("<strong>we</strong>", "<strong>us</strong>", or "<strong>our</strong>")
                            is committed to protecting your privacy and personal data. This Privacy Policy explains how we
                            collect, use, store, and protect your information in compliance with the Digital Personal Data
                            Protection Act, 2023 (DPDP Act), Information Technology Act, 2000, and other applicable Indian laws.
                        </p>
                        <p className="text-muted-foreground leading-relaxed mt-4">
                            By using our platform, you consent to the data practices described in this policy. Please read
                            this policy carefully to understand our practices regarding your personal data.
                        </p>
                    </section>

                    {/* Data We Collect */}
                    <section className="p-6 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>

                        <h3 className="text-xl font-semibold mb-3 mt-6">1.1 Personal Information</h3>
                        <p className="text-muted-foreground mb-2">We collect the following types of personal data:</p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                            <li><strong>Account Information:</strong> Name, email address, phone number, password (encrypted)</li>
                            <li><strong>Birth Details:</strong> Date of birth, time of birth, place of birth (required for astrological services)</li>
                            <li><strong>Profile Information:</strong> Gender, preferred language, profile picture (optional)</li>
                            <li><strong>Payment Information:</strong> Billing details, transaction history (payment card details are processed by our payment gateway and not stored by us)</li>
                            <li><strong>Communication Data:</strong> Consultation chat logs, call recordings, messages with astrologers</li>
                            <li><strong>Technical Data:</strong> IP address, browser type, device information, cookies</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 mt-6">1.2 Automatically Collected Information</h3>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                            <li>Usage data (pages visited, features used, time spent)</li>
                            <li>Device and browser information</li>
                            <li>Location data (with your permission)</li>
                            <li>Cookies and similar tracking technologies</li>
                        </ul>
                    </section>

                    {/* How We Use Data */}
                    <section className="p-6 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
                        <p className="text-muted-foreground mb-4">
                            We process your personal data only for specific, lawful purposes with your consent:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                            <li><strong>Service Delivery:</strong> To provide astrological consultations, generate birth charts, and facilitate communication with astrologers</li>
                            <li><strong>Account Management:</strong> To create and manage your account, authenticate your identity</li>
                            <li><strong>Payment Processing:</strong> To process payments and maintain transaction records</li>
                            <li><strong>Customer Support:</strong> To respond to your inquiries, resolve issues, and provide assistance</li>
                            <li><strong>Platform Improvement:</strong> To analyze usage patterns and improve our services</li>
                            <li><strong>Communication:</strong> To send service updates, promotional offers (with your consent), and important notifications</li>
                            <li><strong>Legal Compliance:</strong> To comply with legal obligations and prevent fraud</li>
                            <li><strong>Quality Assurance:</strong> To monitor consultations for quality and training purposes</li>
                        </ul>
                    </section>

                    {/* Consent */}
                    <section className="p-6 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold mb-4">3. Consent and Your Rights</h2>

                        <h3 className="text-xl font-semibold mb-3">3.1 Obtaining Consent</h3>
                        <p className="text-muted-foreground mb-4">
                            We obtain your free, specific, informed, and unambiguous consent before collecting and processing
                            your personal data. You provide consent through clear affirmative actions such as:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                            <li>Creating an account and accepting our terms</li>
                            <li>Providing birth details for astrological services</li>
                            <li>Opting in to marketing communications</li>
                            <li>Granting permissions for location or camera access</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 mt-6">3.2 Your Rights</h3>
                        <p className="text-muted-foreground mb-2">Under the DPDP Act, 2023, you have the following rights:</p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                            <li><strong>Right to Access:</strong> Request information about your personal data we hold</li>
                            <li><strong>Right to Correction:</strong> Request correction of inaccurate or incomplete data</li>
                            <li><strong>Right to Erasure:</strong> Request deletion of your personal data (subject to legal retention requirements)</li>
                            <li><strong>Right to Withdraw Consent:</strong> Withdraw your consent at any time (may affect service availability)</li>
                            <li><strong>Right to Grievance Redressal:</strong> File complaints about data handling practices</li>
                            <li><strong>Right to Nominate:</strong> Nominate another individual to exercise your rights in case of death or incapacity</li>
                        </ul>
                        <p className="text-muted-foreground mt-4">
                            To exercise these rights, contact us at <strong>privacy@astropanditconnect.com</strong> or through
                            your account settings.
                        </p>
                    </section>

                    {/* Data Sharing */}
                    <section className="p-6 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold mb-4">4. Data Sharing and Disclosure</h2>
                        <p className="text-muted-foreground mb-4">
                            We do not sell, rent, or trade your personal information. We may share your data only in the following circumstances:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                            <li><strong>With Astrologers:</strong> Your birth details and consultation queries are shared with the astrologer you consult</li>
                            <li><strong>Service Providers:</strong> Third-party service providers (payment gateways, cloud hosting, analytics) who assist in operating our platform under strict confidentiality agreements</li>
                            <li><strong>Legal Requirements:</strong> When required by law, court order, or government authorities</li>
                            <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets (with prior notice to you)</li>
                            <li><strong>With Your Consent:</strong> Any other sharing with your explicit permission</li>
                        </ul>
                    </section>

                    {/* Data Security */}
                    <section className="p-6 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold mb-4">5. Data Security</h2>
                        <p className="text-muted-foreground mb-4">
                            We implement reasonable security safeguards to protect your personal data from unauthorized access,
                            alteration, disclosure, or destruction:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                            <li>Encryption of data in transit (SSL/TLS) and at rest</li>
                            <li>Secure authentication and password protection</li>
                            <li>Regular security audits and vulnerability assessments</li>
                            <li>Access controls and employee training on data protection</li>
                            <li>Secure cloud infrastructure with reputable providers</li>
                        </ul>
                        <p className="text-muted-foreground mt-4">
                            While we strive to protect your data, no method of transmission over the internet is 100% secure.
                            We cannot guarantee absolute security but will notify you of any data breaches as required by law.
                        </p>
                    </section>

                    {/* Data Retention */}
                    <section className="p-6 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold mb-4">6. Data Retention</h2>
                        <p className="text-muted-foreground mb-4">
                            We retain your personal data only for as long as necessary to fulfill the purposes outlined in this policy:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                            <li><strong>Account Data:</strong> Retained while your account is active and for [X years] after account closure for legal compliance</li>
                            <li><strong>Consultation Records:</strong> Retained for [X years] for quality assurance and dispute resolution</li>
                            <li><strong>Payment Records:</strong> Retained for [X years] as required by tax and financial regulations</li>
                            <li><strong>Marketing Data:</strong> Retained until you withdraw consent or unsubscribe</li>
                        </ul>
                        <p className="text-muted-foreground mt-4">
                            After the retention period, we securely delete or anonymize your data.
                        </p>
                    </section>

                    {/* Children's Privacy */}
                    <section className="p-6 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold mb-4">7. Children's Privacy</h2>
                        <p className="text-muted-foreground">
                            Our services are not intended for individuals under 18 years of age. We do not knowingly collect
                            personal data from minors without verifiable parental or guardian consent. If we discover that we
                            have collected data from a minor without proper consent, we will delete it promptly. Parents or
                            guardians may book consultations on behalf of minors.
                        </p>
                    </section>

                    {/* Cookies */}
                    <section className="p-6 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold mb-4">8. Cookies and Tracking Technologies</h2>
                        <p className="text-muted-foreground mb-4">
                            We use cookies and similar technologies to enhance your experience, analyze usage, and provide
                            personalized content. Types of cookies we use:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                            <li><strong>Essential Cookies:</strong> Required for platform functionality (authentication, security)</li>
                            <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our platform</li>
                            <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                            <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements (with your consent)</li>
                        </ul>
                        <p className="text-muted-foreground mt-4">
                            You can manage cookie preferences through your browser settings. Disabling certain cookies may
                            affect platform functionality.
                        </p>
                    </section>

                    {/* Data Breach */}
                    <section className="p-6 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold mb-4">9. Data Breach Notification</h2>
                        <p className="text-muted-foreground">
                            In the event of a personal data breach that may cause harm to you, we will notify the Data Protection
                            Board of India and affected users within 72 hours of becoming aware of the breach, as required by
                            the DPDP Act. We will provide information about the nature of the breach, potential consequences,
                            and measures taken to address it.
                        </p>
                    </section>

                    {/* International Transfers */}
                    <section className="p-6 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold mb-4">10. International Data Transfers</h2>
                        <p className="text-muted-foreground">
                            Your data is primarily stored on servers located in India. If we transfer data outside India
                            (e.g., to cloud service providers), we ensure adequate safeguards are in place as required by
                            the DPDP Act, including standard contractual clauses and ensuring the recipient country has
                            adequate data protection laws.
                        </p>
                    </section>

                    {/* Contact & Grievances */}
                    <section className="p-6 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold mb-4">11. Contact Us & Grievance Redressal</h2>
                        <p className="text-muted-foreground mb-4">
                            For any questions, concerns, or complaints regarding this Privacy Policy or our data practices,
                            please contact:
                        </p>
                        <div className="bg-background/50 p-4 rounded-lg">
                            <p className="text-sm">
                                <strong>Data Protection Officer / Grievance Officer:</strong><br />
                                Name: Priya Sharma (DPO)<br />
                                Email: privacy@astropanditconnect.com<br />
                                Address: 123 Jyotish Bhawan, MG Road, New Delhi - 110001<br />
                                Phone: +91 98765 43210
                            </p>
                        </div>
                        <p className="text-muted-foreground mt-4">
                            We will acknowledge your complaint within 48 hours and resolve it within 30 days. If you are not
                            satisfied with our response, you may escalate the matter to the Data Protection Board of India.
                        </p>
                    </section>

                    {/* Changes to Policy */}
                    <section className="p-6 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold mb-4">12. Changes to This Privacy Policy</h2>
                        <p className="text-muted-foreground">
                            We may update this Privacy Policy from time to time to reflect changes in our practices, legal
                            requirements, or platform features. We will notify you of significant changes via email or
                            prominent notice on our platform. The "Last Updated" date at the top indicates when the policy
                            was last revised. Your continued use of our services after changes constitutes acceptance of
                            the updated policy.
                        </p>
                    </section>

                    {/* Governing Law */}
                    <section className="p-6 rounded-lg border border-amber-500/30 bg-amber-500/5">
                        <h2 className="text-2xl font-bold mb-4">13. Governing Law</h2>
                        <p className="text-muted-foreground">
                            This Privacy Policy is governed by and construed in accordance with the laws of India, including
                            the Digital Personal Data Protection Act, 2023, and the Information Technology Act, 2000. Any
                            disputes arising from this policy shall be subject to the exclusive jurisdiction of courts in
                            [City, TO BE ADDED], India.
                        </p>
                    </section>

                </div>
            </div>
        </div>
    );
}
