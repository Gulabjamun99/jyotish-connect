const http = require('http');

const data = JSON.stringify({
    type: 'full',
    data: {
        // 1989-04-24T13:51:00.000 at +05:30
        date: new Date('1989-04-24T13:51:00+05:30').toISOString(),
        lat: 23.35,
        lng: 85.3167
    }
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/astrology/calculate',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, res => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        try {
            if (res.statusCode !== 200) {
                console.log('Error:', res.statusCode, body);
                return;
            }
            const parsed = JSON.parse(body);
            console.log('Ascendant Sign:', parsed.planets.find(p => p.name === 'Asc')?.sign || 'N/A');
            console.log('Ascendant Degree:', parsed.ascendant);
            console.log('Moon Sign:', parsed.planets.find(p => p.name === 'Moon')?.sign);
            console.log('\nPlanets:');
            parsed.planets.forEach(p => {
                console.log(`${p.name}: ${p.sign} ${p.longitude.toFixed(2)} (house ${p.house})`);
            });
            console.log('\nPanchang:');
            console.log(JSON.stringify(parsed.panchang, null, 2));
        } catch (e) {
            console.log('Error parsing response:', e.message);
        }
    });
});

req.on('error', e => console.error('Request error:', e));
req.write(data);
req.end();
