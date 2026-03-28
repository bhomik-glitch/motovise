
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:4000/v1';
const ADMIN_EMAIL = 'admin@ecommerce.com';
const ADMIN_PASS = 'Test@1234';

// Colors
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

function logPass(msg) { console.log(`${GREEN}✅ ${msg}${RESET}`); }
function logFail(msg) { console.log(`${RED}❌ ${msg}${RESET}`); }
function logInfo(msg) { console.log(`ℹ️ ${msg}`); }

async function main() {
    logInfo('Starting Phase 6 Verification Sequence (Node.js)...');

    // 1. Health Check (Poll for 60s)
    let retries = 12; // 12 * 5s = 60s
    while (retries > 0) {
        try {
            const res = await fetch(`${BASE_URL}/health`);
            if (res.ok) {
                logPass('Server Health Check Passed');
                break;
            }
        } catch (e) {
            // ignore
        }
        retries--;
        if (retries === 0) {
            logFail('Server is unreachable. Giving up.');
            process.exit(1);
        }
        logInfo('Waiting for server to start... (5s)');
        await new Promise(r => setTimeout(r, 5000));
    }

    // 2. Auth
    let token = '';
    try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASS })
        });
        const responseJson = await res.json();
        if (!res.ok) throw new Error(responseJson.message || res.statusText);
        token = responseJson.data.accessToken;
        logPass('Admin Authentication Successful');
    } catch (e) {
        logFail(`Admin Login Failed: ${e.message}`);
        process.exit(1);
    }

    // DEBUG: Decode Token
    try {
        const parts = token.split('.');
        if (parts.length === 3) {
            const header = JSON.parse(atob(parts[0]));
            const payload = JSON.parse(atob(parts[1]));
            logInfo(`Token Header: ${JSON.stringify(header)}`);
            logInfo(`Token Payload: ${JSON.stringify(payload)}`);
        }
    } catch (e) {
        logInfo(`Failed to decode token for debug: ${e.message}`);
    }

    // 2b. Verify Token on Simple Endpoint
    try {
        const res = await fetch(`${BASE_URL}/auth/me`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) logPass('Token Validation (/auth/me) Passed');
        else {
            const txt = await res.text();
            logFail(`Token Validation Failed: ${res.status} ${txt}`);
            process.exit(1);
        }
    } catch (e) {
        logFail(`Token Validation Error: ${e.message}`);
        process.exit(1);
    }

    // 3. Create Test Files
    const validJpeg = 'test_valid.jpg';
    const invalidTxt = 'test_invalid.txt';
    const spoofed = 'test_spoofed.jpg';
    const oversized = 'test_large.jpg';

    // Jpeg Magic Bytes: FF D8 FF
    // Use a real 1x1 pixel JPEG base64 to pass Cloudinary validation
    const realJpegBase64 = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigD//2Q==';
    fs.writeFileSync(validJpeg, Buffer.from(realJpegBase64, 'base64'));
    fs.writeFileSync(invalidTxt, 'Not an image');
    fs.writeFileSync(spoofed, 'Text pretending to be jpg');

    // Oversized: 5.5MB
    const bigBuffer = Buffer.alloc(5.5 * 1024 * 1024);
    fs.writeFileSync(oversized, bigBuffer);

    try {
        // Helper
        async function upload(title, files, expectStatus) {
            logInfo(`Testing: ${title}`);
            const formData = new FormData();
            formData.append('name', 'Test Product');
            formData.append('price', '100');
            formData.append('stock', '10');

            for (const f of files) {
                const buffer = fs.readFileSync(f);
                const blob = new Blob([buffer], { type: f.endsWith('.txt') ? 'text/plain' : 'image/jpeg' });
                formData.append('images', blob, f);
            }

            const res = await fetch(`${BASE_URL}/admin/products`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (res.status === expectStatus) {
                logPass(`${title} - Got ${res.status} (Expected)`);
                if (res.status === 201) {
                    const json = await res.json();
                    return json.data;
                }
            } else {
                const err = await res.text();
                logFail(`${title} - Expected ${expectStatus} but got ${res.status}. Response: ${err.substring(0, 100)}...`);
            }
            return null;
        }

        async function cleanup(id) {
            if (!id) return;
            const res = await fetch(`${BASE_URL}/admin/products/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) logPass(`Cleanup: Deleted Product ${id}`);
            else logFail(`Cleanup Failed for ${id}`);
        }

        // Test 1: Single Valid Image
        const p1 = await upload('Valid 1 Image', [validJpeg], 201);
        if (p1 && p1.productImages.length === 1 && p1.productImages[0].isPrimary) {
            logPass('DB Verification: 1 image, isPrimary=true');
        } else if (p1) {
            logFail('DB Verification Failed for Single Image');
        }

        // Test 2: Max 8 Images
        const batch8 = Array(8).fill(validJpeg);
        const p2 = await upload('Valid 8 Images', batch8, 201);

        // Test 3: 9 Images (Fail)
        const batch9 = Array(9).fill(validJpeg);
        await upload('Too Many Images (9)', batch9, 400);

        // Test 4: Invalid MIME
        await upload('Invalid MIME Type', [invalidTxt], 400);

        // Test 5: Magic Number (Spoofed)
        await upload('Spoofed Magic Number', [spoofed], 400);

        // Test 6: Oversized
        await upload('Oversized File (>5MB)', [oversized], 413);

        // Cleanup
        if (p1) await cleanup(p1.id);
        if (p2) await cleanup(p2.id);

    } finally {
        // Cleanup files
        [validJpeg, invalidTxt, spoofed, oversized].forEach(f => {
            if (fs.existsSync(f)) fs.unlinkSync(f);
        });
    }
}

main().catch(console.error);
