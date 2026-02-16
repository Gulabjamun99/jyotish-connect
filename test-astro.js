const { calculatePlanets } = require('./src/lib/astrology/calculator');

try {
    const planets = calculatePlanets(new Date(), 22.9734, 78.6569);
    console.log("Successfully calculated planets:");
    planets.forEach(p => {
        console.log(`${p.name}: ${p.longitude.toFixed(2)}° in ${p.sign} (House ${p.house})`);
    });
} catch (err) {
    console.error("Calculation failed:", err);
    process.exit(1);
}
