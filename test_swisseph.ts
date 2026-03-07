import { SwissephService } from '@/lib/astrology/swisseph-service';

async function main() {
    try {
        const service = SwissephService.getInstance();
        await service.initialize();

        const date = new Date('1989-04-24T13:51:00+05:30');
        const chart = await service.calculatePlanets(date, 23.35, 85.3167);

        console.log('--- Astropandit Calculations ---');
        const asc = chart.find(p => p.name === 'Asc');
        console.log(`Ascendant Sign: ${asc?.sign}`);

        const moon = chart.find(p => p.name === 'Moon');
        console.log(`Moon Sign: ${moon?.sign}`);

        console.log('\nPlanets:');
        chart.forEach(p => {
            console.log(`${p.name}: ${p.sign} ${p.longitude.toFixed(2)}° (house ${p.house})`);
        });
    } catch (e) {
        console.error(e);
    }
}

main();
