import createMiddleware from "next-intl/middleware";

export default createMiddleware({
    locales: ["en", "hi", "ta", "te", "mr", "bn", "gu", "kn"],
    defaultLocale: "en",
});

export const config = {
    matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
