import { promisify } from 'util';

const setTimeoutPromise = promisify(setTimeout);

async function simulateMutation() {
    await setTimeoutPromise(100); // Simulate network delay
    return true;
}

async function runSequential(days) {
    const start = performance.now();
    let created = 0;
    let errors = 0;
    for (const day of days) {
        try {
            await simulateMutation();
            created++;
        } catch {
            errors++;
        }
    }
    const end = performance.now();
    return end - start;
}

async function runConcurrent(days) {
    const start = performance.now();
    let created = 0;
    let errors = 0;

    const results = await Promise.allSettled(
        days.map(() => simulateMutation())
    );

    for (const result of results) {
        if (result.status === 'fulfilled') {
            created++;
        } else {
            errors++;
        }
    }
    const end = performance.now();
    return end - start;
}

async function main() {
    const days = [1, 2, 3, 4, 5]; // Simulate creating 5 schedules
    const seqTime = await runSequential(days);
    const concTime = await runConcurrent(days);

    console.log(`Sequential time: ${seqTime.toFixed(2)}ms`);
    console.log(`Concurrent time: ${concTime.toFixed(2)}ms`);
    console.log(`Improvement: ${((seqTime - concTime) / seqTime * 100).toFixed(2)}%`);
}

main();