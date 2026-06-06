import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(req: Request) {
    try {
        const payload = await req.json();
        const {
            uid,
            displayName,
            email,
            phoneNumber,
            govIdNumber,
            photoURL,
            experience,
            specializations,
            focusAreas,
            languages,
            bio,
            education,
            certificationURL
        } = payload;

        const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'enjoylifeauw@gmail.com';

        const subject = `🚨 Pending Verification: New Astrologer Profile - ${displayName}`;

        const html = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
                <div style="background: #581c87; padding: 40px; text-align: center; color: white;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">🔮 New Astrologer Application</h1>
                    <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.8;">Vedic Verification Required</p>
                </div>

                <div style="padding: 40px; color: #1e293b; line-height: 1.7;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <img src="${photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}" alt="${displayName}" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid #f3e8ff; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);" />
                        <h2 style="margin: 15px 0 5px; color: #581c87; font-size: 24px; font-weight: 800;">Master ${displayName}</h2>
                        <p style="margin: 0; font-size: 14px; color: #64748b;">UID: ${uid}</p>
                    </div>

                    <div style="background: #faf5ff; padding: 25px; border-radius: 16px; border: 1px solid #f3e8ff; margin-bottom: 30px;">
                        <h3 style="margin-top: 0; color: #581c87; font-size: 16px; border-bottom: 1px solid #e9d5ff; padding-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">Profile Information</h3>
                        <table style="width: 100%; border-collapse: collapse; font-size: 14px; text-align: left;">
                            <tr>
                                <th style="padding: 6px 0; color: #64748b; width: 35%;">Email:</th>
                                <td style="padding: 6px 0; font-weight: 600; color: #1e293b;">${email}</td>
                            </tr>
                            <tr>
                                <th style="padding: 6px 0; color: #64748b;">Phone:</th>
                                <td style="padding: 6px 0; font-weight: 600; color: #1e293b;">${phoneNumber || 'Not Provided'}</td>
                            </tr>
                            <tr>
                                <th style="padding: 6px 0; color: #64748b;">Govt ID / Passport:</th>
                                <td style="padding: 6px 0; font-weight: 600; color: #ef4444;">${govIdNumber || 'Not Provided'}</td>
                            </tr>
                            <tr>
                                <th style="padding: 6px 0; color: #64748b;">Experience:</th>
                                <td style="padding: 6px 0; font-weight: 600; color: #1e293b;">${experience} Years</td>
                            </tr>
                            <tr>
                                <th style="padding: 6px 0; color: #64748b;">Education:</th>
                                <td style="padding: 6px 0; font-weight: 600; color: #1e293b;">${education || 'Not Provided'}</td>
                            </tr>
                        </table>
                    </div>

                    <div style="margin-bottom: 25px;">
                        <h3 style="margin: 0 0 8px; color: #581c87; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Vedic Specializations</h3>
                        <div style="margin-top: 5px;">
                            ${specializations.map((spec: string) => `<span style="display: inline-block; background: #f3e8ff; color: #6b21a8; padding: 4px 12px; margin: 4px 4px 4px 0; border-radius: 20px; font-size: 12px; font-weight: bold;">${spec}</span>`).join('')}
                        </div>
                    </div>

                    <div style="margin-bottom: 25px;">
                        <h3 style="margin: 0 0 8px; color: #581c87; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Focus Areas</h3>
                        <div style="margin-top: 5px;">
                            ${focusAreas.map((area: string) => `<span style="display: inline-block; background: #e0f2fe; color: #0369a1; padding: 4px 12px; margin: 4px 4px 4px 0; border-radius: 20px; font-size: 12px; font-weight: bold;">${area}</span>`).join('')}
                        </div>
                    </div>

                    <div style="margin-bottom: 25px;">
                        <h3 style="margin: 0 0 8px; color: #581c87; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Languages</h3>
                        <div style="margin-top: 5px;">
                            ${languages.map((lang: string) => `<span style="display: inline-block; background: #f0fdf4; color: #166534; padding: 4px 12px; margin: 4px 4px 4px 0; border-radius: 20px; font-size: 12px; font-weight: bold;">${lang}</span>`).join('')}
                        </div>
                    </div>

                    <div style="margin-bottom: 30px;">
                        <h3 style="margin: 0 0 8px; color: #581c87; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Biography</h3>
                        <p style="margin: 0; font-size: 13px; color: #475569; background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 12px; font-style: italic;">
                            "${bio}"
                        </p>
                    </div>

                    ${certificationURL ? `
                    <div style="margin-bottom: 30px; text-align: center;">
                        <a href="${certificationURL}" target="_blank" style="display: inline-flex; align-items: center; background: #ffffff; color: #581c87; border: 2px solid #581c87; padding: 10px 20px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px;">
                            📄 Download Vedic Certification PDF
                        </a>
                    </div>
                    ` : ''}

                    <div style="text-align: center; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 30px;">
                        <a href="https://jyotish-connect-nine.vercel.app/admin/verify-astrologers" style="background: #581c87; color: white; padding: 16px 32px; text-decoration: none; border-radius: 16px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(88, 28, 135, 0.3);">
                            Go to Admin Panel to Verify Profile
                        </a>
                        <p style="margin: 10px 0 0; font-size: 11px; color: #94a3b8;">Review and align this guide's cosmic status.</p>
                    </div>
                </div>
            </div>
        `;

        await sendEmail({
            to: adminEmail,
            subject,
            html
        });

        return NextResponse.json({ success: true, message: "Verification request email sent to admin" });
    } catch (error: any) {
        console.error("Astrologer registration email error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
