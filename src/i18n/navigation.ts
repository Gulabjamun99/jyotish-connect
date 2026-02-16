import { createNavigation } from 'next-intl/navigation';

export const locales = ["en", "hi", "ta", "te", "mr", "bn", "gu", "kn"];
export const localePrefix = 'always';

export const { Link, redirect, usePathname, useRouter } =
    createNavigation({ locales, localePrefix });
