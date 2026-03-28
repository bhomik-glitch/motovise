const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
        page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

        console.log("Navigating...");
        await page.goto('http://localhost:3000/admin/login', { waitUntil: 'domcontentloaded' });

        console.log("Waiting 3s for React...");
        await new Promise(r => setTimeout(r, 3000));

        const html = await page.evaluate(() => document.body.innerHTML);
        console.log("BODY HTML:", html);

        await browser.close();
    } catch (e) {
        console.error(e);
    }
})();
