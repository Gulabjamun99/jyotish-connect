import Link from "next/link";

export function Footer() {
    return (
        <footer className="w-full border-t border-primary/10 bg-transparent py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-primary">JyotishConnect</h3>
                        <p className="text-sm text-muted-foreground">
                            Connecting you with the cosmos through verified expert astrologers.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Features</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/search" className="hover:text-primary">Verified Experts</Link></li>
                            <li><Link href="/horoscope" className="hover:text-primary">Daily Horoscope</Link></li>
                            <li><Link href="/kundli" className="hover:text-primary">Kundli Matching</Link></li>
                            <li><Link href="/video-consultation" className="hover:text-primary">Video Calls</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Support</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/faq" className="hover:text-primary">FAQ</Link></li>
                            <li><Link href="/contact" className="hover:text-primary">Contact Us</Link></li>
                            <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h4>
                        <p className="text-sm text-muted-foreground">
                            Email: support@jyotishconnect.com<br />
                            Follow us on Instagram & Twitter
                        </p>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} JyotishConnect. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
