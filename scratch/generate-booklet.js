const fs = require('fs');
const path = require('path');
const { jsPDF } = require("jspdf");

// Paths to resources
const artifactsDir = "C:\\Users\\user\\.gemini\\antigravity\\brain\\cbeecf4c-4b58-46bc-83bd-a3ad0e460a04";
const pdfOutputPath = path.join(artifactsDir, "AstroPandit_Connect_Booklet.pdf");

const imgPath1 = path.join(artifactsDir, "chat_screen_mockup_1780925012099.png");
const imgPath2 = path.join(artifactsDir, "media__1780922732105.png");
const imgPath3 = path.join(artifactsDir, "media__1780305270967.jpg");

function getBase64Image(filePath) {
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath);
        const ext = path.extname(filePath).toLowerCase();
        const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
        return `data:${mimeType};base64,${data.toString('base64')}`;
    }
    return null;
}

const doc = new jsPDF('p', 'mm', 'a4');
const pageW = doc.internal.pageSize.getWidth(); // 210
const pageH = doc.internal.pageSize.getHeight(); // 297

// Helper for drawing header/footer on content pages
function drawHeaderFooter(pageNumber, titleText) {
    // Header
    doc.setDrawColor(249, 115, 22); // Orange #f97316
    doc.setLineWidth(0.5);
    doc.line(15, 15, pageW - 15, 15);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("ASTROPANDIT CONNECT - FLOW & ARCHITECTURE BOOKLET", 15, 11);
    doc.text(titleText.toUpperCase(), pageW - 15, 11, { align: "right" });

    // Footer
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(15, pageH - 15, pageW - 15, pageH - 15);
    
    doc.text("CONFIDENTIAL - FOR INTERNAL USE ONLY", 15, pageH - 11);
    doc.text(`Page ${pageNumber}`, pageW - 15, pageH - 11, { align: "right" });
}

// ----------------------------------------------------
// PAGE 1: COVER PAGE
// ----------------------------------------------------
// Draw deep dark background
doc.setFillColor(26, 26, 26); // Dark Gray #1a1a1a
doc.rect(0, 0, pageW, pageH, "F");

// Decorative Orange Accent block on left
doc.setFillColor(249, 115, 22); // Orange #f97316
doc.rect(0, 0, 10, pageH, "F");

// Title
doc.setFont("helvetica", "bold");
doc.setFontSize(32);
doc.setTextColor(249, 115, 22); // Orange
doc.text("ASTROPANDIT CONNECT", 25, 80);

// Subtitle
doc.setFont("helvetica", "normal");
doc.setFontSize(18);
doc.setTextColor(255, 255, 255);
doc.text("Interactive Web App Flow & Architecture Guide", 25, 95);

// Description paragraph
doc.setFontSize(11);
doc.setTextColor(200, 200, 200);
const desc = "A comprehensive operational blueprint and technical reference detailing the user journeys, astrologer console dynamics, administrative management consoles, real-time consultation rooms, and transactional structures.";
const splitDesc = doc.splitTextToSize(desc, 160);
doc.text(splitDesc, 25, 110);

// Meta Details
doc.setFont("helvetica", "bold");
doc.setFontSize(10);
doc.setTextColor(249, 115, 22);
doc.text("SYSTEM ARCHITECTURE BOOKLET", 25, 210);

doc.setFont("helvetica", "normal");
doc.setFontSize(10);
doc.setTextColor(255, 255, 255);
doc.text("Prepared for: Company Owner / Project Lead", 25, 220);
doc.text("Author: AstroPandit Technical Development Partner", 25, 226);
doc.text("Date of Publication: June 2026", 25, 232);
doc.text("Target Platform: Next.js (Client/Server) & Firebase Cloud Suite", 25, 238);

// ----------------------------------------------------
// PAGE 2: TABLE OF CONTENTS & OVERVIEW
// ----------------------------------------------------
doc.addPage();
drawHeaderFooter(2, "Overview & Index");

doc.setFont("helvetica", "bold");
doc.setFontSize(22);
doc.setTextColor(26, 26, 26);
doc.text("Table of Contents", 15, 30);

doc.setDrawColor(249, 115, 22);
doc.setLineWidth(1);
doc.line(15, 33, 60, 33);

// TOC Items
const toc = [
    { num: "1", title: "Executive Platform Summary", page: "2" },
    { num: "2", title: "Seeker (User) Journey & Astrology Services", page: "3" },
    { num: "3", title: "Astrologer Onboarding & Expert Workspace", page: "4" },
    { num: "4", title: "Admin Monitoring Console & Approvals Portal", page: "5" },
    { num: "5", title: "Live Consultation Room & Chat Mechanics", page: "6" },
    { num: "6", title: "Technical Architecture & Database Collections Schema", page: "7" },
    { num: "7", title: "Security Protocols & Leak Mitigations", page: "8" }
];

let tocY = 45;
toc.forEach(item => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(249, 115, 22);
    doc.text(item.num, 15, tocY);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(26, 26, 26);
    doc.text(item.title, 22, tocY);
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(120, 120, 120);
    doc.text(item.page, pageW - 20, tocY, { align: "right" });
    
    // Dot leader lines
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.line(75, tocY - 1, pageW - 25, tocY - 1);
    
    tocY += 12;
});

// Section 1: Executive Platform Summary
doc.setFont("helvetica", "bold");
doc.setFontSize(16);
doc.setTextColor(26, 26, 26);
doc.text("1. Executive Platform Summary", 15, tocY + 10);

doc.setFont("helvetica", "normal");
doc.setFontSize(10.5);
doc.setTextColor(60, 60, 60);
const summaryText = "AstroPandit Connect is a modern, real-time consultation and astrology platform engineered to bridge Seekers (users searching for astrological guidance) with verified Astrologers (Vedic experts). Built using Next.js 15, TailwindCSS, and Firebase, the platform delivers zero-latency consultation chatrooms, dynamic Kundli matchmaking calculators, localized daily Panchang indices, and secure wallet recharge workflows.";
const splitSummary = doc.splitTextToSize(summaryText, 180);
doc.text(splitSummary, 15, tocY + 18);

// Add decorative quote box
doc.setFillColor(243, 244, 246);
doc.rect(15, tocY + 50, pageW - 30, 25, "F");
doc.setDrawColor(249, 115, 22);
doc.setLineWidth(1.5);
doc.line(15, tocY + 50, 15, tocY + 75);

doc.setFont("helvetica", "italic");
doc.setFontSize(10);
doc.setTextColor(80, 80, 80);
const quote = "The core design philosophy targets premium glassmorphism aesthetics, accessibility across mobile/desktop, robust security rules preventing unauthorized data leakages, and dynamic fallback pipelines for cloud asset management.";
doc.text(doc.splitTextToSize(quote, 170), 20, tocY + 56);

// ----------------------------------------------------
// PAGE 3: SEEKER (USER) JOURNEY
// ----------------------------------------------------
doc.addPage();
drawHeaderFooter(3, "Seeker Journey & Services");

doc.setFont("helvetica", "bold");
doc.setFontSize(18);
doc.setTextColor(26, 26, 26);
doc.text("2. Seeker (User) Journey & Astrology Services", 15, 30);

doc.setDrawColor(249, 115, 22);
doc.setLineWidth(1);
doc.line(15, 33, 100, 33);

doc.setFont("helvetica", "normal");
doc.setFontSize(10);
doc.setTextColor(60, 60, 60);
const seekerIntro = "The Seeker represents the core consumer role. Their experience begins with authentication and expands into personalized astrology calculations and direct live astrologer consultations.";
doc.text(doc.splitTextToSize(seekerIntro, 180), 15, 39);

// Step by Step Flow
const steps = [
    { title: "Authentication & Onboarding", detail: "Users register via `/login`. New users are directed to `/onboarding` to save their birth details (Date, Time, Location). This data is cached in client context to pre-fill future requests." },
    { title: "Daily Horoscope & Localized Panchang", detail: "Visiting `/horoscope` queries coordinates dynamically. Using the client's IP address (fallback for local development) or Vercel Geo-IP headers, the system queries local coordinates to compute exact Sunrise, Sunset, and Tithi times." },
    { title: "Janam Kundli & Matchmaking", detail: "Seekers generate their birth chart at `/kundli` or perform matchmaking at `/kundli-matching`. Added an 'Already Married' option which automatically strips future marriage windows, replacing them with a custom compatibility card." },
    { title: "Booking & Live Consultations", detail: "Seekers browse verified experts, recharge their wallet using Razorpay integration at `/user/transactions`, and request a live session at `/consult/[id]`." }
];

let stepY = 52;
steps.forEach((step, idx) => {
    // Circle number
    doc.setFillColor(249, 115, 22);
    doc.circle(20, stepY + 3, 4, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text((idx + 1).toString(), 19, stepY + 6);
    
    // Step Text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(26, 26, 26);
    doc.text(step.title, 28, stepY + 4);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(80, 80, 80);
    const splitDet = doc.splitTextToSize(step.detail, 165);
    doc.text(splitDet, 28, stepY + 9);
    
    stepY += 22;
});

// Embed Seeker UI Sample Image
const img3Base64 = getBase64Image(imgPath3);
if (img3Base64) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(26, 26, 26);
    doc.text("Seeker Matchmaking Panel & Interface View:", 15, stepY + 10);
    
    // A4 width is 210. Margins are 15 on each side, leaving 180.
    // Standard photo height: 60mm
    doc.addImage(img3Base64, 'JPEG', 15, stepY + 14, 180, 75);
}

// ----------------------------------------------------
// PAGE 4: ASTROLOGER JOURNEY
// ----------------------------------------------------
doc.addPage();
drawHeaderFooter(4, "Astrologer Onboarding & Console");

doc.setFont("helvetica", "bold");
doc.setFontSize(18);
doc.setTextColor(26, 26, 26);
doc.text("3. Astrologer Onboarding & Expert Workspace", 15, 30);

doc.setDrawColor(249, 115, 22);
doc.setLineWidth(1);
doc.line(15, 33, 100, 33);

doc.setFont("helvetica", "normal");
doc.setFontSize(10);
doc.setTextColor(60, 60, 60);
const astroIntro = "Astrologers represent the professional service providers. They complete onboarding, manage availability, review earnings, and connect with users inside specialized dashboards.";
doc.text(doc.splitTextToSize(astroIntro, 180), 15, 39);

// Step by Step Flow
const astroSteps = [
    { title: "Signup & Professional Onboarding", detail: "Astrologers register at `/astrologer/signup` and complete a detailed resume at `/astrologer/onboarding` (submittingGovt ID, certificates, bio, languages, experience, and pricing per minute)." },
    { title: "Robust Upload Fallbacks (Base64)", detail: "If Firebase Storage is deactivated, the app triggers a Base64 converter fallback. Uploaded avatars and PDF documents are saved directly inside Firestore as Data URI strings, ensuring onboarding succeeds." },
    { title: "Royal Purple Dashboard", detail: "Restyled the dashboard (`/astrologer/dashboard`) using Indigo & Royal Purple highlights. This instantly differentiates the expert console from the seeker's warm gold panel, displaying pending queues and metrics." },
    { title: "Consultation & Payout Transactions", detail: "Experts receive calls, review transcripts, and check total earnings in `/astrologer/transactions`, requesting wallet payouts directly." }
];

let astroY = 52;
astroSteps.forEach((step, idx) => {
    doc.setFillColor(109, 40, 217); // Royal Purple #6d28d9
    doc.circle(20, astroY + 3, 4, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text((idx + 1).toString(), 19, astroY + 6);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(26, 26, 26);
    doc.text(step.title, 28, astroY + 4);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(80, 80, 80);
    const splitDet = doc.splitTextToSize(step.detail, 165);
    doc.text(splitDet, 28, astroY + 9);
    
    astroY += 22;
});

// Embed Astrologer Onboarding Sample Image
const img2Base64 = getBase64Image(imgPath2);
if (img2Base64) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(26, 26, 26);
    doc.text("Astrologer Profile Preview & Verification Card:", 15, astroY + 10);
    
    doc.addImage(img2Base64, 'PNG', 15, astroY + 14, 180, 75);
}

// ----------------------------------------------------
// PAGE 5: ADMIN JOURNEY & APPROVALS
// ----------------------------------------------------
doc.addPage();
drawHeaderFooter(5, "Admin Console & Approvals");

doc.setFont("helvetica", "bold");
doc.setFontSize(18);
doc.setTextColor(26, 26, 26);
doc.text("4. Admin Monitoring Console & Approvals Portal", 15, 30);

doc.setDrawColor(249, 115, 22);
doc.setLineWidth(1);
doc.line(15, 33, 100, 33);

doc.setFont("helvetica", "normal");
doc.setFontSize(10.5);
doc.setTextColor(60, 60, 60);
const adminIntro = "The Admin (Company Owner) has superuser permissions. Only 'enjoylifeauw@gmail.com' is assigned this role. The Admin reviews applicants, tracks business metrics, and manages verification updates.";
const splitAdminIntro = doc.splitTextToSize(adminIntro, 180);
doc.text(splitAdminIntro, 15, 39);

// Admin Features Layout
const adminFeatures = [
    { title: "Real-Time Firestore Business Metrics", desc: "The admin dashboard at `/admin` aggregates total platform revenue by summing recharge transactions (`completed` status) in real time. It counts active experts and shows total booking volumes." },
    { title: "Approvals & Verifications Panel", desc: "Located at `/admin/verify-astrologers`. When a new astrologer signs up, their profile details are listed. The admin inspects the government ID, experience parameters, and certificate links before approving." },
    { title: "Security Bypass Controls", desc: "The admin bypasses standard onboarding limits. This enables the owner to review both Seeker and Astrologer dashboards to check layouts, availability controls, and consult pages without restriction." },
    { title: "One-Click Quick Actions (Email Alerts)", desc: "When an astrologer applies, an email alert containing profile data is dispatched. The email contains two quick links pointing to `/api/admin/verify-astrologer-direct?action=approve/reject`. The API route automatically routes to the client verification screen to process the request securely." }
];

let adminY = 56;
adminFeatures.forEach(feat => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(249, 115, 22);
    doc.text(`* ${feat.title}`, 15, adminY);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(70, 70, 70);
    const splitDesc = doc.splitTextToSize(feat.desc, 175);
    doc.text(splitDesc, 20, adminY + 5);
    
    adminY += 20;
});

// Summary block
doc.setFillColor(254, 243, 199); // Light yellow
doc.rect(15, adminY + 10, pageW - 30, 22, "F");
doc.setDrawColor(217, 119, 6);
doc.setLineWidth(1);
doc.rect(15, adminY + 10, pageW - 30, 22);

doc.setFont("helvetica", "bold");
doc.setFontSize(9.5);
doc.setTextColor(180, 83, 9);
doc.text("ADMIN ROLE ASSIGNMENT NOTICE:", 20, adminY + 16);
doc.setFont("helvetica", "normal");
doc.setFontSize(9);
doc.text("Role assignments are controlled in AuthContext.tsx. Admin email overrides ignore raw Firestore records to prevent privilege escalations.", 20, adminY + 23);

// ----------------------------------------------------
// PAGE 6: LIVE CONSULTATION ROOM & CHAT
// ----------------------------------------------------
doc.addPage();
drawHeaderFooter(6, "Live Consultation Room");

doc.setFont("helvetica", "bold");
doc.setFontSize(18);
doc.setTextColor(26, 26, 26);
doc.text("5. Live Consultation Room & Chat Mechanics", 15, 30);

doc.setDrawColor(249, 115, 22);
doc.setLineWidth(1);
doc.line(15, 33, 100, 33);

doc.setFont("helvetica", "normal");
doc.setFontSize(10.5);
doc.setTextColor(60, 60, 60);
const chatIntro = "Consultations happen inside a real-time web workspace at `/consult/[id]`. This panel manages chat messages, transcript exports, and peer-to-peer connection statuses.";
doc.text(doc.splitTextToSize(chatIntro, 180), 15, 39);

// Features list
const chatFeatures = [
    { key: "UID-Based Chat Bubble Alignment", val: "To support multiple device logins and administrator testing, chat message ownership is verified using Firestore UIDs (`senderId` matches the logged-in viewer's UID). Outgoing messages slide to the right (colored white), while incoming messages align to the left (colored light green)." },
    { key: "WhatsApp-Inspired UI", val: "Designed a clean WhatsApp-themed interface with separate avatar displays, name indicators, and timestamp tags, ensuring high readability." },
    { key: "Dynamic Participant Identifiers", val: "Names (e.g. 'Seeker Name' or 'Astrologer Name') are fetched dynamically on mount from the consultation record. Fallback labels prevent 'You' vs name duplication, maintaining a cohesive view." }
];

let chatY = 50;
chatFeatures.forEach(feat => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(26, 26, 26);
    doc.text(feat.key + ":", 15, chatY);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(80, 80, 80);
    const splitVal = doc.splitTextToSize(feat.val, 175);
    doc.text(splitVal, 15, chatY + 5);
    
    chatY += doc.splitTextToSize(feat.val, 175).length * 4.5 + 8;
});

// Embed Chat Mockup Image
const img1Base64 = getBase64Image(imgPath1);
if (img1Base64) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(26, 26, 26);
    doc.text("Live Consultation Chat Room Workspace Interface:", 15, chatY + 2);
    
    doc.addImage(img1Base64, 'PNG', 15, chatY + 6, 180, 75);
}

// ----------------------------------------------------
// PAGE 7: TECHNICAL ARCHITECTURE & SCHEMA
// ----------------------------------------------------
doc.addPage();
drawHeaderFooter(7, "Architecture & Schema");

doc.setFont("helvetica", "bold");
doc.setFontSize(18);
doc.setTextColor(26, 26, 26);
doc.text("6. Technical Architecture & DB Collections", 15, 30);

doc.setDrawColor(249, 115, 22);
doc.setLineWidth(1);
doc.line(15, 33, 100, 33);

doc.setFont("helvetica", "normal");
doc.setFontSize(10);
doc.setTextColor(60, 60, 60);
const archText = "AstroPandit Connect is built with Next.js (app router) for the frontend, styled with Vanilla CSS and TailwindCSS, and leverages Firebase Cloud Suite for backend services.";
doc.text(doc.splitTextToSize(archText, 180), 15, 39);

// Firestore Schema Table / Description
doc.setFont("helvetica", "bold");
doc.setFontSize(12);
doc.setTextColor(26, 26, 26);
doc.text("Firestore Database Schema Mapping:", 15, 48);

const collections = [
    { name: "users", fields: "uid (ID), email, displayName, role (seeker/astrologer/admin), createdAt, profileComplete" },
    { name: "astrologers", fields: "uid (ID), name, email, experience, specializations, ratePerMinute, verified, govIdNumber" },
    { name: "bookings", fields: "id (ID), seekerId, astrologerId, status (scheduled/completed), startTime, duration" },
    { name: "transactions", fields: "id (ID), userId, amount, type (recharge/payout), status (pending/completed), gatewayOrderId" },
    { name: "transcripts", fields: "consultationId (ID), messages [ { senderId, senderName, text, timestamp } ], status" }
];

let tableY = 55;
collections.forEach(col => {
    doc.setFillColor(243, 244, 246);
    doc.rect(15, tableY, pageW - 30, 14, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(249, 115, 22);
    doc.text(col.name.toUpperCase(), 18, tableY + 5);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(80, 80, 80);
    doc.text("Fields: " + col.fields, 18, tableY + 10);
    
    tableY += 16;
});

// Key Platform Services
doc.setFont("helvetica", "bold");
doc.setFontSize(12);
doc.setTextColor(26, 26, 26);
doc.text("Key Infrastructure Services:", 15, tableY + 5);

const services = [
    "Firebase Auth: User registration, Google OAuth, and secure session management.",
    "Firebase Firestore: Real-time data sync for chat transcripts, reviews, and bookings.",
    "Razorpay SDK: Secure payment gateway integration for user wallet recharges.",
    "SMTP / NodeMailer Client: Gmail SMTP transactional email alerts for new registrations."
];

let serviceY = tableY + 11;
services.forEach(serv => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(60, 60, 60);
    doc.text(`- ${serv}`, 15, serviceY);
    serviceY += 5.5;
});

// ----------------------------------------------------
// PAGE 8: SECURITY PROTOCOLS & SUMMARY
// ----------------------------------------------------
doc.addPage();
drawHeaderFooter(8, "Security Protocols & Conclusion");

doc.setFont("helvetica", "bold");
doc.setFontSize(18);
doc.setTextColor(26, 26, 26);
doc.text("7. Security Protocols & Leak Mitigations", 15, 30);

doc.setDrawColor(249, 115, 22);
doc.setLineWidth(1);
doc.line(15, 33, 100, 33);

const securityNotes = [
    { title: "No Hardcoded Credentials", desc: "The exposed GCP API Key was eliminated from source files. The app dynamically queries credentials from process.env (Vercel settings) in production and parses .env.local locally, preventing keys from leaking into the public Git repository history." },
    { title: "Safe Dynamic Path Traversals", desc: "Removed the unused deep_search.js file. Restricting path inclusions prevents potential directory traversal attacks and ensures that the server filesystem is inaccessible to external inputs." },
    { title: "DOM XSS Input Sanitization", desc: "Removed innerHTML in public tools (like camera-test.html). Replaced them with textContent and createElement DOM injections to guarantee all browser data is treated strictly as plain text, resolving DOM clobbering vulnerabilities." },
    { title: "Transitive Dependency Auditing", desc: "Declared strict npm overrides for protobufjs, lodash, axios, serialize-javascript, fast-uri, rollup, next-intl, brace-expansion, and fast-xml-parser, closing all CVE entry points flagged by static SCA scanning." }
];

let secY = 40;
securityNotes.forEach(note => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(26, 26, 26);
    doc.text(`* ${note.title}`, 15, secY);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(80, 80, 80);
    const splitDesc = doc.splitTextToSize(note.desc, 175);
    doc.text(splitDesc, 20, secY + 5);
    
    secY += (splitDesc.length * 4.5) + 8;
});

// Final Conclusion Block
doc.setFont("helvetica", "bold");
doc.setFontSize(13);
doc.setTextColor(26, 26, 26);
doc.text("Conclusion & Future Scope", 15, secY + 5);

doc.setFont("helvetica", "normal");
doc.setFontSize(9.5);
doc.setTextColor(60, 60, 60);
const conclusionText = "AstroPandit Connect is now fully secured against all vulnerabilities flagged by SCA reports and SAST engines, and conforms to industry standards. Future development blocks include setting up custom verified email domains for nodemailer and configuring Firebase Storage rules to restrict access to authenticated users.";
doc.text(doc.splitTextToSize(conclusionText, 175), 15, secY + 11);

// Save to PDF
try {
    doc.save(pdfOutputPath);
    console.log(`SUCCESS: PDF Booklet generated successfully at: ${pdfOutputPath}`);
} catch (e) {
    console.error("PDF generation failed:", e);
}
