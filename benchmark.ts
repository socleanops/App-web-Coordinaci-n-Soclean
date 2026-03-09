const simulateMutateAsync = async () => {
    return new Promise(resolve => setTimeout(resolve, 50)); // 50ms per request
};

const data = Array.from({ length: 100 }, (_, i) => ({ id: i }));

async function runSequential() {
    const start = performance.now();
    for (let i = 0; i < data.length; i++) {
        await simulateMutateAsync();
    }
    const end = performance.now();
    return end - start;
}

async function runChunked(chunkSize: number) {
    const start = performance.now();
    for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        await Promise.all(chunk.map(() => simulateMutateAsync()));
    }
    const end = performance.now();
    return end - start;
}

async function main() {
    console.log("Running sequential benchmark...");
    const seqTime = await runSequential();
    console.log(`Sequential time: ${seqTime.toFixed(2)} ms`);

    console.log("Running chunked benchmark (size 10)...");
    const chunkTime10 = await runChunked(10);
    console.log(`Chunked time (size 10): ${chunkTime10.toFixed(2)} ms`);

    console.log("Running chunked benchmark (size 20)...");
    const chunkTime20 = await runChunked(20);
    console.log(`Chunked time (size 20): ${chunkTime20.toFixed(2)} ms`);

    console.log(`Improvement factor (size 10): ${(seqTime / chunkTime10).toFixed(2)}x`);
    console.log(`Improvement factor (size 20): ${(seqTime / chunkTime20).toFixed(2)}x`);
}

main();
