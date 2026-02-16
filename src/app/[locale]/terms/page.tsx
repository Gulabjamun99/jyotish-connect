export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                        Terms of Service
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
                            Welcome to JyotishConnect ("<strong>Platform</strong>", "<strong>we</strong>", "<strong>us</strong>",
                            or "<strong>our</strong>"). These Terms of Service ("<strong>Terms</strong>") govern your access to and
                            use of our astrology consultation platform and services.
                        </p>
                        <p className="text-muted-foreground leading-relaxed mt-4">
                            By accessing or using our Platform, you agree to be bound by these Terms and our Privacy Policy.
                            If you do not agree with these Terms, please do not use our services.
                        </p>
                    </section>

                    {/* Important Disclaimer */}
                    <section className="p-6 rounded-lg border border-amber-500/30 bg-amber-500/5">
                        <h2 className="text-2xl font-bold mb-4 text-amber-600">⚠️ Important Disclaimer</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            <strong>Astrology is a traditional belief system and interpretive art.</strong> Services provided
                            on this Platform are for entertainment, spiritual guidance, and personal belief purposes only.
                            Astrological predictions, readings, and consultations:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                            <li>Are NOT guaranteed to be accurate or effective</li>
                            <li>Should NOT be considered as substitutes for professional medical, legal, financial, or psychological advice</li>
                            <li>Are based on interpretations that may vary between astrologers</li>
                            <li>Do NOT guarantee any specific outcomes or results</li>
                        </ul>
                        <p className="text-muted-foreground mt-4">
                            <strong>You are solely responsible for any decisions or actions you take based on astrological
                                consultations.</strong> We strongly recommend consulting qualified professionals for medical, legal,
                            or financial matters.
                        </p>
                    </section>

                    {/* Eligibility */}
                    <section className="p-6 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold mb-4">1. Eligibility</h2>
                        <p className="text-muted-foreground mb-4">
                            To use our Platform, you must:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                            <li>Be at least 18 years of age or the age of majority in your jurisdiction</li>
                            <li>Have the legal capacity to enter into binding contracts</li>
                            <li>Provide accurate and complete registration information</li>
                            <li>Comply with all applicable laws and regulations in India</li>
                        </ul>
                        <p className="text-muted-foreground mt-4">
                            Parents or legal guardians may create accounts and book consultations on behalf of minors,
                            subject to our Privacy Policy regarding children's data.
                        </p>
                    </section>

                    {/* Platform Role */}
                    <section className="p-6 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold mb-4">2. Platform as Intermediary</h2>
                        <p className="text-muted-foreground mb-4">
                            JyotishConnect acts as an <strong>intermediary platform</strong> that facilitates connections
                            between users and independent astrologers. We:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                            <li>Provide the technology infrastructure for consultations</li>
                            <li>Verify astrologer credentials and experience</li>
                            <li>Process payments and maintain transaction records</li>
                            <li>Offer customer support and dispute resolution</li>
                        </ul>
                        <p className="text-muted-foreground mt-4">
                            <strong>We do NOT:</strong>
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                            <li>Provide astrological advice ourselves</li>
                            <li>Guarantee the accuracy, quality, or outcomes of consultations</li>
                            <li>Control or direct astrologers' interpretations or predictions</li>
                            <li>Assume liability for astrologers' advice or your reliance on it</li>
                        </ul>
                        <p className="text-muted-foreground mt-4">
                            Astrologers are independent contractors, not our employees. The consultation is between you
                            and the astrologer.
                        </p>
                    </section>

                    {/* Account Responsibilities */}
                    <section className="p-6 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold mb-4">3. Account Registration and Security</h2>
                        <p className="text-muted-foreground mb-4">
                            When creating an account, you agree to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                            <li>Provide accurate, current, and complete information</li>
                            <li>Maintain and update your information as needed</li>
                            <li>Keep your password confidential and secure</li>
                            <li>Notify us immediately of any unauthorized account access</li>
                            <li>Accept responsibility for all activities under your account</li>
                            <li>Not share your account with others or create multiple accounts</li>
                        </ul>
                        <p className="text-muted-foreground mt-4">
                            We reserve the right to suspend or terminate accounts that violate these Terms or engage in
                            fraudulent activity.
                        </p>
                    </section>

                    {/* Services */}
                    <section className="p-6 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold mb-4">4. Services Offered</h2>
                        <p className="text-muted-foreground mb-4">
                            Our Platform offers the following services:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                            <li><strong>Consultations:</strong> Chat, audio, and video consultations with verified astrologers</li>
                            <li><strong>Birth Chart Generation:</strong> Automated Kundli/horoscope creation based on birth details</li>
                            <li><strong>Kundli Matching:</strong> Compatibility analysis for marriage/relationships</li>
                            <li><strong>Daily Horoscopes:</strong> General astrological forecasts by zodiac sign</li>
                            <li><strong>Reports:</strong> Downloadable astrological reports and charts</li>
                        </ul>
                        <p className="text-muted-foreground mt-4">
                            We reserve the right to modify, suspend, or discontinue any service at any time with or without notice.
                        </p>
                    </section>

                    {/* Prohibited Practices */}
                    <section className="p-6 rounded-lg border border-red-500/30 bg-red-500/5">
                        <h2 className="text-2xl font-bold mb-4 text-red-600">5. Prohibited Practices</h2>
                        <p className="text-muted-foreground mb-4">
                            The following practices are strictly prohibited on our Platform:
                        </p>

                        <h3 className="text-lg font-semibold mb-2 mt-4">5.1 For Users:</h3>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                            <li>Requesting or expecting medical, legal, or financial advice from astrologers</li>
                            <li>Harassing, threatening, or abusing astrologers</li>
                            <li>Sharing false or misleading information</li>
                            <li>Attempting to circumvent payment systems</li>
                            <li>Recording consultations without consent</li>
                            <li>Using the Platform for illegal activities</li>
                        </ul>

                        <h3 className="text-lg font-semibold mb-2 mt-4">5.2 For Astrologers:</h3>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                            <li>Providing medical, legal, or financial advice</li>
                            <li>Offering black magic, tantra, or harmful practices</li>
                            <li>Making absolute guarantees about outcomes (e.g., "100% guaranteed marriage")</li>
                            <li>Providing investment or stock market predictions without SEBI registration</li>
                            <li>Soliciting clients outside the Platform</li>
                            <li>Sharing client information without consent</li>
                            <li>Engaging in fraudulent or deceptive practices</li>
                        </ul>
                        <p className="text-muted-foreground mt-4">
                            Violation of these prohibitions may result in immediate account termination and legal action.
                        </p>
                    </section>

                    {/* Payments */}
                    <section className="p-6 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold mb-4">6. Payments and Pricing</h2>

                        <h3 className="text-xl font-semibold mb-3">6.1 Pricing</h3>
                        <p className="text-muted-foreground mb-4">
                            Consultation fees are set by individual astrologers and displayed on their profiles. Prices may vary
                            based on astrologer experience, consultation type, and duration. All prices are in Indian Rupees (INR)
                            and include applicable taxes.
                        </p>

                        <h3 className="text-xl font-semibold mb-3 mt-6">6.2 Payment Processing</h3>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                            <li>Payments are processed securely through our payment gateway (Razorpay)</li>
                            <li>You must provide valid payment information</li>
                            <li>Payment is required before or at the start of consultations</li>
                            <li>We may charge platform fees or service charges (clearly disclosed)</li>
                            <li>Transaction receipts are available in your account</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 mt-6">6.3 Wallet and Credits</h3>
                        <p className="text-muted-foreground">
                            You may add funds to your Platform wallet for convenience. Wallet credits are non-transferable
                            and non-refundable except as required by law.
                        </p>
                    </section>

                    {/* Refund Policy */}
                    <section className="p-6 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold mb-4">7. Refund and Cancellation Policy</h2>
                        <p className="text-muted-foreground mb-4">
                            In compliance with the Consumer Protection Act, 2019 and E-Commerce Rules, 2020:
                        </p>

                        <h3 className="text-xl font-semibold mb-3">7.1 Eligible for Full Refund:</h3>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                            <li>Technical issues preventing consultation (Platform failure, connectivity issues on our end)</li>
                            <li>Astrologer fails to join scheduled consultation within 10 minutes</li>
                            <li>Duplicate or erroneous charges</li>
                            <li>Cancellation by astrologer</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 mt-6">7.2 Partial Refund:</h3>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                            <li>Consultation interrupted due to technical issues (refund for unused time)</li>
                            <li>User cancellation more than 24 hours before scheduled consultation (subject to cancellation fee)</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 mt-6">7.3 NOT Eligible for Refund:</h3>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                            <li>Completed consultations (you received the service)</li>
                            <li>Dissatisfaction with astrological predictions or advice</li>
                            <li>User cancellation less than 24 hours before consultation</li>
                            <li>User no-show or failure to join consultation</li>
                            <li>Technical issues on user's end (poor internet, device problems)</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 mt-6">7.4 Refund Process:</h3>
                        <p className="text-muted-foreground">
                            Refund requests must be submitted within 48 hours of the consultation via our support channels.
                            Approved refunds are processed within 5-7 business days to the original payment method. We reserve
                            the right to investigate refund requests and may deny fraudulent claims.
                        </p>
                    </section>

                    {/* Intellectual Property */}
                    <section className="p-6 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold mb-4">8. Intellectual Property Rights</h2>
                        <p className="text-muted-foreground mb-4">
                            All content on the Platform, including but not limited to text, graphics, logos, software, and design,
                            is owned by JyotishConnect or licensed to us and protected by Indian and international intellectual
                            property laws.
                        </p>
                        <p className="text-muted-foreground mb-4">
                            You may not:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                            <li>Copy, reproduce, or distribute Platform content without permission</li>
                            <li>Use our trademarks, logos, or branding without authorization</li>
                            <li>Reverse engineer or attempt to extract source code</li>
                            <li>Create derivative works based on our Platform</li>
                        </ul>
                        <p className="text-muted-foreground mt-4">
                            Your birth charts and consultation reports are provided for personal use only and may not be
                            commercially redistributed.
                        </p>
                    </section>

                    {/* User Conduct */}
                    <section className="p-6 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold mb-4">9. User Conduct and Responsibilities</h2>
                        <p className="text-muted-foreground mb-4">
                            You agree to use the Platform responsibly and ethically. You are responsible for:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                            <li>Exercising discretion when sharing sensitive personal information</li>
                            <li>Making informed decisions based on your own judgment</li>
                            <li>Treating astrologers with respect and courtesy</li>
                            <li>Providing accurate birth details for accurate readings</li>
                            <li>Understanding that astrology is interpretive and not scientifically proven</li>
                            <li>Not relying solely on astrological advice for major life decisions</li>
                        </ul>
                    </section>

                    {/* Limitation of Liability */}
                    <section className="p-6 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold mb-4">10. Limitation of Liability</h2>
                        <p className="text-muted-foreground mb-4">
                            To the maximum extent permitted by law:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                            <li>We are NOT liable for the accuracy, quality, or outcomes of astrological consultations</li>
                            <li>We are NOT responsible for decisions you make based on astrological advice</li>
                            <li>We are NOT liable for indirect, incidental, or consequential damages</li>
                            <li>Our total liability is limited to the amount you paid for the specific service in question</li>
                            <li>We do not guarantee uninterrupted or error-free service</li>
                        </ul>
                        <p className="text-muted-foreground mt-4">
                            This limitation applies except where prohibited by law or in cases of our gross negligence or
                            willful misconduct.
                        </p>
                    </section>

                    {/* Termination */}
                    <section className="p-6 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold mb-4">11. Account Termination</h2>
                        <p className="text-muted-foreground mb-4">
                            We reserve the right to suspend or terminate your account if you:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                            <li>Violate these Terms of Service</li>
                            <li>Engage in fraudulent or illegal activities</li>
                            <li>Abuse or harass astrologers or other users</li>
                            <li>Provide false information</li>
                            <li>Attempt to manipulate or game the system</li>
                        </ul>
                        <p className="text-muted-foreground mt-4">
                            You may also request account deletion at any time through your account settings or by contacting
                            support. Upon termination, your access to paid services will cease, and refunds will be processed
                            according to our refund policy.
                        </p>
                    </section>

                    {/* Dispute Resolution */}
                    <section className="p-6 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold mb-4">12. Dispute Resolution and Grievances</h2>
                        <p className="text-muted-foreground mb-4">
                            If you have any complaints or disputes:
                        </p>
                        <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-4">
                            <li>Contact our customer support at support@astropanditconnect.com</li>
                            <li>If unresolved, escalate to our Grievance Officer (details in Contact Us page)</li>
                            <li>We will acknowledge complaints within 48 hours and resolve within 30 days</li>
                            <li>If still unresolved, you may file a complaint with the Consumer Commission under the Consumer Protection Act, 2019</li>
                        </ol>
                        <p className="text-muted-foreground mt-4">
                            For disputes requiring legal action, both parties agree to first attempt mediation or arbitration
                            before pursuing litigation.
                        </p>
                    </section>

                    {/* Governing Law */}
                    <section className="p-6 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold mb-4">13. Governing Law and Jurisdiction</h2>
                        <p className="text-muted-foreground">
                            These Terms are governed by and construed in accordance with the laws of India, including but not
                            limited to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-3">
                            <li>Consumer Protection Act, 2019</li>
                            <li>Digital Personal Data Protection Act, 2023</li>
                            <li>Information Technology Act, 2000</li>
                            <li>Indian Contract Act, 1872</li>
                        </ul>
                        <p className="text-muted-foreground mt-4">
                            Any legal disputes shall be subject to the exclusive jurisdiction of the courts in New Delhi, India.
                        </p>
                    </section>

                    {/* Changes to Terms */}
                    <section className="p-6 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold mb-4">14. Changes to Terms</h2>
                        <p className="text-muted-foreground">
                            We reserve the right to modify these Terms at any time. Significant changes will be notified via
                            email or prominent notice on the Platform. The "Last Updated" date indicates when Terms were last
                            revised. Your continued use of the Platform after changes constitutes acceptance of the updated Terms.
                            If you do not agree with changes, you must stop using the Platform.
                        </p>
                    </section>

                    {/* Severability */}
                    <section className="p-6 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold mb-4">15. Severability</h2>
                        <p className="text-muted-foreground">
                            If any provision of these Terms is found to be invalid or unenforceable by a court of law, the
                            remaining provisions shall continue in full force and effect.
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="p-6 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold mb-4">16. Contact Information</h2>
                        <p className="text-muted-foreground mb-4">
                            For questions about these Terms of Service, please contact:
                        </p>
                        <div className="bg-background/50 p-4 rounded-lg">
                            <p className="text-sm">
                                <strong>JyotishConnect</strong><br />
                                Email: legal@astropanditconnect.com<br />
                                Support: support@astropanditconnect.com<br />
                                Address: 123 Jyotish Bhawan, MG Road, New Delhi - 110001, India<br />
                                GST Number: 07XXXXX1234X1ZX (To be registered)
                            </p>
                        </div>
                    </section>

                    {/* Acceptance */}
                    <section className="p-6 rounded-lg border border-green-500/30 bg-green-500/5">
                        <h2 className="text-2xl font-bold mb-4 text-green-600">Acceptance of Terms</h2>
                        <p className="text-muted-foreground">
                            By creating an account or using our Platform, you acknowledge that you have read, understood, and
                            agree to be bound by these Terms of Service and our Privacy Policy. You confirm that you are
                            eligible to use the Platform and accept full responsibility for your use of our services.
                        </p>
                    </section>

                </div>
            </div>
        </div>
    );
}
