import Link from "next/link";

export function Footer() {
    return (
        <footer className="w-full border-t border-white/5 bg-transparent py-14 relative overflow-hidden">
            {/* Subtle glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-primary/5 blur-[100px] pointer-events-none" />
            
            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">JyotishConnect</h3>
                        <p className="text-sm text-muted-foreground/80 leading-relaxed">
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
                <div className="mt-14 pt-8 border-t border-white/5 text-center text-[11px] uppercase tracking-widest text-muted-foreground/50 font-bold">
                    © {new Date().getFullYear()} JyotishConnect. All cosmic rights reserved.
                </div>
            </div>
        </footer>
    );
}
