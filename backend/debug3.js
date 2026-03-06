const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
        page.on('request', request => {
            if (request.url().includes('auth')) {
                console.log('REQUEST:', request.method(), request.url());
            }
        });
        page.on('response', response => {
            if (response.url().includes('auth')) {
                console.log('RESPONSE:', response.status(), response.url());
            }
        });

        console.log("Navigating...");
        await page.goto('http://localhost:3000/admin/login', { waitUntil: 'domcontentloaded' });

        console.log("Waiting for input...");
        await page.waitForSelector('input[type="email"]');
        await page.type('input[type="email"]', 'admin@ecommerce.com');
        await page.type('input[type="password"]', 'Test@1234');

        console.log("Clicking submit...");
        await page.click('button[type="submit"]');

        console.log("Waiting 10s for full stabilization...");
        await new Promise(r => setTimeout(r, 10000));

        const url = page.url();
        console.log("FINAL URL:", url);

        const html = await page.evaluate(() => document.body.innerText.substring(0, 500));
        console.log("FINAL TEXT (start):", html);

        const hasDashboard = await page.evaluate(() => !!document.querySelector('.admin-shell') || document.body.innerText.includes('Dashboard'));
        console.log("HAS DASHBOARD UI:", hasDashboard);

        await browser.close();
    } catch (e) {
        console.error(e);
    }
})();
