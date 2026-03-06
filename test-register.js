const axios = require('axios');

async function test() {
    try {
        const res = await axios.post('http://localhost:3001/v1/auth/register', {
            name: 'Test Tester',
            email: `test${Date.now()}@example.com`,
            password: 'password123'
        });
        console.log(res.status, res.data);
    } catch (e) {
        if (e.response) {
            console.log(e.response.status, e.response.data);
        } else {
            console.error(e.message);
        }
    }
}
test();
