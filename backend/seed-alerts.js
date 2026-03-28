const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding sample alerts...');

    // Backend Enums: OVERALL_RTO, PINCODE_RTO, CHARGEBACK_RATE, MANUAL_REVIEW_QUEUE

    const now = new Date();
    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    const twentySixHoursAgo = new Date(now.getTime() - 26 * 60 * 60 * 1000);

    const sampleAlerts = [
        {
            type: 'OVERALL_RTO',
            status: 'ACTIVE',
            pincode: null,
            metricValue: 28.5,
            thresholdValue: 25.0,
            firstTriggeredAt: threeHoursAgo,
            lastNotifiedAt: threeHoursAgo,
            createdAt: threeHoursAgo,
        },
        {
            type: 'PINCODE_RTO',
            status: 'ACTIVE',
            pincode: '110001',
            metricValue: 45.2,
            thresholdValue: 40.0,
            firstTriggeredAt: twentySixHoursAgo,
            lastNotifiedAt: twentySixHoursAgo,
            createdAt: twentySixHoursAgo,
        },
        {
            type: 'CHARGEBACK_RATE',
            status: 'RESOLVED',
            pincode: null,
            metricValue: 0.5,
            thresholdValue: 0.8,
            firstTriggeredAt: now,
            resolvedAt: now,
            status: 'RESOLVED',
            createdAt: twentySixHoursAgo,
        },
        {
            type: 'MANUAL_REVIEW_QUEUE',
            status: 'ACTIVE',
            pincode: null,
            metricValue: 65,
            thresholdValue: 50,
            firstTriggeredAt: now,
            lastNotifiedAt: now,
            createdAt: now,
        }
    ];

    for (const data of sampleAlerts) {
        await prisma.alert.create({ data });
    }

    console.log('Done.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
