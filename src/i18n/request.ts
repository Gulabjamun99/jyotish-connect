import { getRequestConfig } from "next-intl/server";

// @ts-ignore
export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale;

    // Validate that the incoming `locale` parameter is valid
    const locales = ["en", "hi", "ta", "te", "mr", "bn", "gu", "kn"];
    if (!locale || !locales.includes(locale)) {
        locale = "en";
    }

    console.log(`[i18n] Loading messages for locale: ${locale}`);

    return {
        locale: locale as string,
        messages: (await import(`../../messages/${locale}.json`)).default,
    };
});
