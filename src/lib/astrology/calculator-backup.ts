import { AstrologyService } from "./swisseph-service";
import { calculateGuna } from "./gun-milan";
import { calculateAllDivisions } from "./divisional-charts";
import { detectYogas } from "./yoga-engine";
import { generateRemedies } from "./remedy-engine";

export function calculatePanchang(date: Date, planets: any[], lat: number = 22.9734, lng: number = 78.6569) {
    const sun = planets.find(p => p.name === "Sun");
    const moon = planets.find(p => p.name === "Moon");

    if (!sun || !moon) return {};

    // 1. Tithi (12 degrees per Tithi)
    let diff = moon.longitude - sun.longitude;
    if (diff < 0) diff += 360;
    const tithi = Math.floor(diff / 12) + 1;
    const paksha = tithi <= 15 ? "Shukla" : "Krishna";

    // 2. Yoga (Sun + Moon, 13 deg 20 min per Yoga)
    let sum = moon.longitude + sun.longitude;
    if (sum >= 360) sum -= 360;
    const yoga = Math.floor(sum / (360 / 27)) + 1;

    // 3. Karana (6 degrees per Karana, starts from 2nd half of 1st Tithi)
    const karana = Math.floor(diff / 6) + 1;

    // 4. Vara (Weekday)
    const vara = date.getDay(); // 0 is Sunday

    // 5. Sunrise & Sunset Calculation for IST
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
    const latRad = (lat * Math.PI) / 180;

    // Solar declination approximation
    const declination = Math.asin(Math.sin(23.45 * Math.PI / 180) * Math.sin((360 / 365) * (dayOfYear - 81) * Math.PI / 180));

    // Hour angle at sunrise/sunset
    const cosHourAngle = -Math.tan(latRad) * Math.tan(declination);
    const hourAngle = Math.acos(Math.max(-1, Math.min(1, cosHourAngle))) * 180 / Math.PI;

    // Calculate sunrise/sunset in UTC
    const sunriseUTC = 12 - hourAngle / 15 - lng / 15;
    const sunsetUTC = 12 + hourAngle / 15 - lng / 15;

    // Convert to IST (UTC+5:30)
    const istOffset = 5.5;
    const sunriseIST = sunriseUTC + istOffset;
    const sunsetIST = sunsetUTC + istOffset;

    // Format time as HH:MM
    const formatTime = (decimal: number) => {
        let hours = Math.floor(decimal);
        while (hours < 0) hours += 24;
        while (hours >= 24) hours -= 24;
        const minutes = Math.round((decimal - Math.floor(decimal)) * 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    return {
        tithi: tithi > 30 ? 30 : tithi,
        paksha,
        yoga: yoga > 27 ? 27 : yoga,
        karana: karana > 60 ? 60 : karana,
        vara,
        sunrise: formatTime(sunriseIST),
        sunset: formatTime(sunsetIST)
    };
}
